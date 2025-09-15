// lib/services/category.ts
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import {
  // Validation schemas and types
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryFiltersInput,
  type CategoryProductFiltersInput,
  type CategoryResponse,
  type CategoryProductsResponse,
  type CategoryStats,
  
  // Validation schemas
  createCategorySchema,
  updateCategorySchema,
  categoryFiltersSchema,
  categoryProductFiltersSchema,
  
  // Error messages
  CATEGORY_ERROR_MESSAGES,
  
  // Validation helpers
  validateCategoryBusinessRules,
} from '@/lib/validations/category'

import {
  // Types from types file
  type CategorySelectOption
} from '@/types/category'

export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'ApiError'
  }
}

// Tipos específicos para match com os routes existentes
export interface CategoryListItem extends CategoryResponse {
  productCount?: number
  productsPreview?: Array<{
    id: number
    name: string
    price: number
    code: string
  }>
}

export interface CategoryWithDetails extends CategoryResponse {
  productCount: number
  statistics?: {
    totalProducts: number
    totalValue: number
    averagePrice: number
    lowStockProducts: number
    totalInventoryValue: number
  }
  recentProducts?: Array<{
    id: number
    name: string
    price: number
    code: string
    createdAt: Date
    inventory?: {
      quantity: number
      minStock: number
      maxStock?: number | null
      location?: string | null
      lastUpdate: Date
    } | null
  }>
}

export interface ProductInCategory {
  id: number
  name: string
  description: string | null  // Remove ? and undefined
  price: number
  code: string
  barcode: string | null      // Remove ? and undefined
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  supplier: {
    id: number
    name: string
    contactPerson: string | null  // Remove ? and undefined
  } | null
  inventory: {
    quantity: number
    minStock: number
    maxStock: number | null
    location: string | null
    lastUpdate: Date
  } | null
  recentSales?: Array<{
    quantity: number
    total: number
    date: Date
    status: string
  }>
}

export class CategoryService {
  // =================== LIST CATEGORIES ===================
  
  static async findMany(
    filters: CategoryFiltersInput,
    userRole: string
  ): Promise<{
    categories: CategoryListItem[]
    total: number
    filters: {
      search?: string
      isActive?: boolean
      hasCnae?: boolean
      sortBy: string
      sortOrder: string
    }
  }> {
    try {
      // Validate filters
      const validatedFilters = categoryFiltersSchema.parse(filters)

      const {
        search,
        isActive,
        hasCnae,
        sortBy,
        sortOrder,
        includeProductCount
      } = validatedFilters

      // Build WHERE clause
      const where: Prisma.CategoryWhereInput = {
        // Default to active categories only
        isActive: isActive ?? true,
        
        // Search by name or description
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
        
        // Filter by having CNAE or not
        ...(hasCnae !== undefined && {
          cnae: hasCnae ? { not: null } : null
        })
      }

      // Configure ordering
      let orderBy: Prisma.CategoryOrderByWithRelationInput = {}
      
      if (sortBy === 'productCount' && includeProductCount) {
        orderBy = { products: { _count: sortOrder as Prisma.SortOrder } }
      } else {
        orderBy = { [sortBy]: sortOrder as Prisma.SortOrder }
      }

      // Fetch categories
      const categories = await prisma.category.findMany({
        where,
        include: {
          // Include product count if requested
          ...(includeProductCount && {
            _count: {
              select: { 
                products: {
                  where: { isActive: true } // Only active products
                }
              }
            }
          }),
          // For admins and managers, include some products as preview
          ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
            products: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                price: true,
                code: true
              },
              take: 3, // Only 3 products as preview
              orderBy: { createdAt: 'desc' }
            }
          })
        },
        orderBy
      })

      // Format response
      const formattedCategories = categories.map((category: any): CategoryListItem => ({
        id: category.id,
        name: category.name,
        description: category.description,
        cnae: category.cnae,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        // Include count if requested
        ...(includeProductCount && {
          productCount: category._count?.products || 0
        }),
        // Include product preview for admins/managers
        ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
          productsPreview: category.products || []
        })
      }))

      return {
        categories: formattedCategories,
        total: categories.length,
        filters: {
          search,
          isActive,
          hasCnae,
          sortBy,
          sortOrder
        }
      }

    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Erro ao buscar categorias', 500)
    }
  }

  // =================== CREATE CATEGORY ===================

  static async create(data: CreateCategoryInput): Promise<CategoryListItem> {
    try {
      // Validate input data
      const validatedData = createCategorySchema.parse(data)

      // Check business rules
      const businessRuleErrors = validateCategoryBusinessRules(validatedData)
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(', '), 400)
      }

      // Check if name already exists
      const existingCategory = await prisma.category.findFirst({
        where: { 
          name: {
            equals: validatedData.name,
            mode: 'insensitive'
          }
        }
      })

      if (existingCategory) {
        throw new ApiError('Categoria com este nome já existe', 409)
      }

      // Check if CNAE is already in use
      if (validatedData.cnae) {
        const existingCnae = await prisma.category.findFirst({
          where: { cnae: validatedData.cnae }
        })

        if (existingCnae) {
          throw new ApiError('CNAE já está sendo usado por outra categoria', 409)
        }
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          cnae: validatedData.cnae,
          isActive: validatedData.isActive
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      return {
        ...category,
        productCount: category._count.products
      } as CategoryListItem

    } catch (error) {
      if (error instanceof ApiError) throw error

      if ((error as any).code === 'P2002') {
        const meta = (error as any).meta
        if (meta?.target?.includes('name')) {
          throw new ApiError('Categoria com este nome já existe', 409)
        }
        if (meta?.target?.includes('cnae')) {
          throw new ApiError('CNAE já está sendo usado por outra categoria', 409)
        }
      }

      throw new ApiError('Erro ao criar categoria', 500)
    }
  }

  // =================== GET CATEGORY WITH DETAILS ===================

  static async findByIdWithDetails(categoryId: number, userRole: string): Promise<CategoryWithDetails> {
    try {
      // Find category
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { 
              products: {
                where: { isActive: true }
              }
            }
          },
          // For admins and managers, include detailed statistics
          ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
            products: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                price: true,
                code: true,
                createdAt: true,
                inventory: {
                  select: {
                    quantity: true,
                    minStock: true,
                    maxStock: true,
                    location: true,
                    lastUpdate: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 10 // Top 10 most recent products
            }
          })
        }
      })

      if (!category) {
        throw new ApiError(CATEGORY_ERROR_MESSAGES.NOT_FOUND, 404)
      }

      // Calculate statistics if admin/manager
      let statistics = null
      if (['ADMIN', 'MANAGER'].includes(userRole) && category.products) {
        const products = category.products
        statistics = {
          totalProducts: products.length,
          totalValue: products.reduce((sum: number, p: any) => sum + this.decimalToNumber(p.price), 0),
          averagePrice: products.length > 0 
            ? products.reduce((sum: number, p: any) => sum + this.decimalToNumber(p.price), 0) / products.length
            : 0,
          lowStockProducts: products.filter((p: any) =>
            p.inventory && p.inventory.quantity <= p.inventory.minStock
          ).length,
          totalInventoryValue: products.reduce((sum: number, p: any) =>
            sum + (this.decimalToNumber(p.price) * (p.inventory?.quantity || 0)), 0
          )
        }
      }

      // Convert products for response
      const recentProducts = category.products?.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: this.decimalToNumber(product.price),
        code: product.code,
        createdAt: product.createdAt,
        inventory: product.inventory
      }))

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        cnae: category.cnae,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category._count.products,
        ...(statistics && { statistics }),
        ...(recentProducts && { recentProducts })
      }

    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Erro ao buscar categoria', 500)
    }
  }

  // =================== UPDATE CATEGORY ===================

  static async update(
    categoryId: number, 
    data: UpdateCategoryInput
  ): Promise<CategoryListItem> {
    try {
      // Validate input data
      const validatedData = updateCategorySchema.parse({ ...data, id: categoryId })

      // Check business rules
      const businessRuleErrors = validateCategoryBusinessRules(validatedData)
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(', '), 400)
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      if (!existingCategory) {
        throw new ApiError(CATEGORY_ERROR_MESSAGES.NOT_FOUND, 404)
      }

      // Check if name already exists (if being changed)
      if (validatedData.name && validatedData.name !== existingCategory.name) {
        const nameExists = await prisma.category.findFirst({
          where: { 
            name: {
              equals: validatedData.name,
              mode: 'insensitive'
            },
            id: { not: categoryId }
          }
        })

        if (nameExists) {
          throw new ApiError('Categoria com este nome já existe', 409)
        }
      }

      // Check if CNAE is already in use (if being changed)
      if (validatedData.cnae && validatedData.cnae !== existingCategory.cnae) {
        const cnaeExists = await prisma.category.findFirst({
          where: { 
            cnae: validatedData.cnae,
            id: { not: categoryId }
          }
        })

        if (cnaeExists) {
          throw new ApiError('CNAE já está sendo usado por outra categoria', 409)
        }
      }

      // Check if trying to deactivate category with active products
      if (validatedData.isActive === false && existingCategory._count.products > 0) {
        const activeProducts = await prisma.product.count({
          where: { 
            categoryId: categoryId,
            isActive: true
          }
        })

        if (activeProducts > 0) {
          throw new ApiError('Não é possível desativar categoria que possui produtos ativos', 409)
        }
      }

      // Update category
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.description !== undefined && { description: validatedData.description }),
          ...(validatedData.cnae !== undefined && { cnae: validatedData.cnae }),
          ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      return {
        ...updatedCategory,
        productCount: updatedCategory._count.products
      } as CategoryListItem

    } catch (error) {
      if (error instanceof ApiError) throw error

      if ((error as any).code === 'P2002') {
        const meta = (error as any).meta
        if (meta?.target?.includes('name')) {
          throw new ApiError('Categoria com este nome já existe', 409)
        }
        if (meta?.target?.includes('cnae')) {
          throw new ApiError('CNAE já está sendo usado por outra categoria', 409)
        }
      }

      throw new ApiError('Erro ao atualizar categoria', 500)
    }
  }

  // =================== DELETE CATEGORY ===================

  static async delete(categoryId: number): Promise<{
    message: string
    deletedCategory: {
      id: number
      name: string
    }
  }> {
    try {
      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      if (!existingCategory) {
        throw new ApiError(CATEGORY_ERROR_MESSAGES.NOT_FOUND, 404)
      }

      // Check if category has products
      if (existingCategory._count.products > 0) {
        throw new ApiError('Não é possível deletar categoria que possui produtos', 409)
      }

      // Delete category (hard delete only if no products)
      await prisma.category.delete({
        where: { id: categoryId }
      })

      return {
        message: 'Categoria deletada com sucesso',
        deletedCategory: {
          id: existingCategory.id,
          name: existingCategory.name
        }
      }

    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Erro ao excluir categoria', 500)
    }
  }

  // =================== GET CATEGORY PRODUCTS ===================

  static async getCategoryProducts(
    categoryId: number,
    filters: CategoryProductFiltersInput,
    userRole: string
  ): Promise<CategoryProductsResponse> {
    try {
      // Validate filters
      const validatedFilters = categoryProductFiltersSchema.parse(filters)

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true, isActive: true }
      })

      if (!category) {
        throw new ApiError(CATEGORY_ERROR_MESSAGES.NOT_FOUND, 404)
      }

      const {
        search,
        minPrice,
        maxPrice,
        inStock,
        isActive,
        page,
        limit,
        sortBy,
        sortOrder
      } = validatedFilters

      // Build WHERE clause
      const where: Prisma.ProductWhereInput = {
        categoryId: categoryId,
        isActive: isActive,
        
        // Search by name, code or description
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
        
        // Price filters
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
        
        // Stock filter
        ...(inStock !== undefined && {
          inventory: inStock 
            ? { quantity: { gt: 0 } }
            : { quantity: { lte: 0 } }
        })
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit

      // Fetch products and total
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            supplier: {
              select: { id: true, name: true, contactPerson: true }
            },
            inventory: {
              select: { 
                quantity: true, 
                minStock: true, 
                maxStock: true,
                location: true,
                lastUpdate: true
              }
            },
            // For admins/managers, include sales data
            ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
              saleItems: {
                select: {
                  quantity: true,
                  total: true,
                  sale: {
                    select: {
                      createdAt: true,
                      status: true
                    }
                  }
                },
                where: {
                  sale: {
                    status: 'COMPLETED'
                  }
                },
                orderBy: {
                  sale: {
                    createdAt: 'desc'
                  }
                },
                take: 5 // Last 5 sales
              }
            })
          },
          orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
          skip: offset,
          take: limit
        }),
        prisma.product.count({ where })
      ])

      // Calculate category statistics
      const categoryStats = await prisma.product.aggregate({
        where: { categoryId, isActive: true },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _count: { id: true }
      })

      // Calculate inventory statistics
      const inventoryStats = await prisma.inventory.aggregate({
        where: { 
          product: { 
            categoryId, 
            isActive: true 
          } 
        },
        _sum: { quantity: true },
        _avg: { quantity: true }
      })

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      // Format products for response
      const formattedProducts: ProductInCategory[] = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description ?? null,  // Convert undefined to null
        price: this.decimalToNumber(product.price),
        code: product.code,
        barcode: product.barcode ?? null,          // Convert undefined to null
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        supplier: product.supplier ? {
          id: product.supplier.id,
          name: product.supplier.name,
          contactPerson: product.supplier.contactPerson ?? null  // Convert undefined to null
        } : null,
        inventory: product.inventory,
        // Include sales data for admins/managers
        ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
          recentSales: product.saleItems?.map((item: any) => ({
            quantity: item.quantity,
            total: this.decimalToNumber(item.total),
            date: item.sale.createdAt,
            status: item.sale.status
          })) || []
        })
      }))

      return {
        category: {
          id: category.id,
          name: category.name,
          isActive: category.isActive
        },
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        statistics: {
          category: {
            totalProducts: categoryStats._count.id || 0,
            averagePrice: this.decimalToNumber(categoryStats._avg.price),
            minPrice: this.decimalToNumber(categoryStats._min.price),
            maxPrice: this.decimalToNumber(categoryStats._max.price)
          },
          inventory: {
            totalQuantity: inventoryStats._sum.quantity || 0,
            averageQuantity: inventoryStats._avg.quantity || 0
          }
        },
        filters: validatedFilters
      }

    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Erro ao buscar produtos da categoria', 500)
    }
  }

  // =================== UTILITIES ===================

  static formatCategoryForSelect(category: any): CategorySelectOption {
    return {
      value: category.id,
      label: category.cnae ? `${category.name} (${category.cnae})` : category.name,
      cnae: category.cnae,
      isActive: category.isActive
    }
  }

  static async searchCategories(query: string, limit: number = 10): Promise<CategorySelectOption[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { cnae: { contains: query } }
          ]
        },
        take: limit,
        orderBy: { name: 'asc' }
      })

      return categories.map(this.formatCategoryForSelect)

    } catch (error) {
      throw new ApiError('Erro ao buscar categorias', 500)
    }
  }

  // =================== STATISTICS ===================

  static async getStatistics(): Promise<CategoryStats> {
    try {
      const [
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithProducts,
        categoriesWithCnae
      ] = await Promise.all([
        prisma.category.count(),
        prisma.category.count({ where: { isActive: true } }),
        prisma.category.count({ where: { isActive: false } }),
        prisma.category.count({
          where: {
            products: {
              some: { isActive: true }
            }
          }
        }),
        prisma.category.count({
          where: { cnae: { not: null } }
        })
      ])

      const [productsByCategory, topCategories] = await Promise.all([
        this.getProductsByCategory(),
        this.getTopCategories()
      ])

      return {
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithProducts,
        categoriesWithCnae,
        productsByCategory,
        topCategories
      }

    } catch (error) {
      throw new ApiError('Erro ao obter estatísticas de categorias', 500)
    }
  }

  // =================== PRIVATE METHODS ===================

  private static async getProductsByCategory(): Promise<Record<string, number>> {
    const result = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    const productsByCategory: Record<string, number> = {}

    result.forEach((category) => {
      productsByCategory[category.name] = category._count.products
    })

    return productsByCategory
  }

  private static async getTopCategories(limit: number = 10): Promise<Array<{
    id: number
    name: string
    productCount: number
    totalRevenue: number
  }>> {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      },
      take: limit
    })

    // For now, return with 0 revenue as we would need sales data
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category._count.products,
      totalRevenue: 0 // Would calculate from sales
    }))
  }

  // Add this helper function at the top of the class
  private static decimalToNumber(value: unknown): number {
    if (typeof value === 'number') return value
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return (value as Prisma.Decimal).toNumber()
    }
    return Number(value) || 0
  }
}