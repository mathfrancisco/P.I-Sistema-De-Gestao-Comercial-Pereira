import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { categoryProductsSchema } from "@/lib/validations/category"
import { Prisma } from "@prisma/client"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID da categoria inválido' },
        { status: 400 }
      )
    }

    // Verificar se categoria existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, isActive: true }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params_obj = Object.fromEntries(searchParams)
    
    // Validar parâmetros
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
    } = categoryProductsSchema.parse(params_obj)

    // Construir filtros do Prisma
    const where: Prisma.ProductWhereInput = {
      categoryId: categoryId,
      isActive: isActive,
      
      // Busca por nome, código ou descrição
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      
      // Filtros de preço
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      
      // Filtro de estoque
      ...(inStock !== undefined && {
        inventory: inStock 
          ? { quantity: { gt: 0 } }
          : { quantity: { lte: 0 } }
      })
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Buscar produtos e total
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
          // Para admins/managers, incluir dados de vendas
          ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
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
              take: 5 // Últimas 5 vendas
            }
          })
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Calcular estatísticas da categoria
    const categoryStats = await prisma.product.aggregate({
      where: { categoryId, isActive: true },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
      _count: { id: true }
    })

    // Calcular estatísticas de estoque
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

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Formatar produtos para resposta
    const formattedProducts = products.map((product: { id: any; name: any; description: any; price: any; code: any; barcode: any; isActive: any; createdAt: any; updatedAt: any; supplier: any; inventory: any; saleItems: { quantity: any; total: any; sale: { createdAt: any; status: any } }[] }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      code: product.code,
      barcode: product.barcode,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      supplier: product.supplier,
      inventory: product.inventory,
      // Incluir dados de vendas para admins/managers
      ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
        recentSales: product.saleItems?.map((item: { quantity: any; total: any; sale: { createdAt: any; status: any } }) => ({
          quantity: item.quantity,
          total: item.total,
          date: item.sale.createdAt,
          status: item.sale.status
        })) || []
      })
    }))

    console.log(`✅ [${user.role}] ${user.email} listou ${products.length} produtos da categoria: ${category.name}`)

    return NextResponse.json({
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
          totalProducts: categoryStats._count.id,
          averagePrice: categoryStats._avg.price || 0,
          minPrice: categoryStats._min.price || 0,
          maxPrice: categoryStats._max.price || 0
        },
        inventory: {
          totalQuantity: inventoryStats._sum.quantity || 0,
          averageQuantity: inventoryStats._avg.quantity || 0
        }
      },
      filters: {
        search,
        minPrice,
        maxPrice,
        inStock,
        isActive
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
