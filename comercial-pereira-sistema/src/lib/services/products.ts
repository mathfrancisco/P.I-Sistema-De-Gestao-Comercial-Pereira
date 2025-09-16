// lib/services/products.ts
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import {
    CreateProductInput,
    UpdateProductInput,
    ProductFiltersInput,
    ProductSearchInput,
    CheckCodeInput,
    BulkImportInput,
    ProductResponse,
    ProductWithStats,
    ProductsListResponse,
    ProductStatsResponse,
    ProductSelectOption,
    PRODUCT_ERROR_MESSAGES,
    formatProductCode
} from '@/lib/validations/product'

export class ApiError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message)
        this.name = 'ApiError'
    }
}

export class ProductService {
    // =================== CREATE ===================

    static async create(data: CreateProductInput, currentUserId: number): Promise<ProductResponse> {
        try {
            const {
                name,
                description,
                price,
                code,
                barcode,
                categoryId,
                supplierId,
                isActive,
                initialStock,
                minStock,
                maxStock,
                location
            } = data

            return await prisma.$transaction(async (tx) => {
                // 1. Validar categoria existe e está ativa
                const category = await tx.category.findUnique({
                    where: { id: categoryId }
                })

                if (!category) {
                    throw new ApiError(PRODUCT_ERROR_MESSAGES.CATEGORY_NOT_FOUND, 404)
                }

                if (!category.isActive) {
                    throw new ApiError(PRODUCT_ERROR_MESSAGES.CATEGORY_INACTIVE, 400)
                }

                // 2. Validar fornecedor se informado
                if (supplierId) {
                    const supplier = await tx.supplier.findUnique({
                        where: { id: supplierId }
                    })

                    if (!supplier) {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.SUPPLIER_NOT_FOUND, 404)
                    }

                    if (!supplier.isActive) {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.SUPPLIER_INACTIVE, 400)
                    }
                }

                // 3. Formatar e validar código único
                const formattedCode = formatProductCode(code)
                await this.validateUniqueCode(formattedCode)

                // 4. Validar código de barras único se informado
                if (barcode) {
                    await this.validateUniqueBarcode(barcode)
                }

                // 5. Criar produto
                const product = await tx.product.create({
                    data: {
                        name: name.trim(),
                        description: description?.trim() || null,
                        price: new Prisma.Decimal(price),
                        code: formattedCode,
                        barcode: barcode || null,
                        categoryId,
                        supplierId: supplierId || null,
                        isActive: isActive ?? true
                    },
                    include: {
                        category: { select: { id: true, name: true, description: true } },
                        supplier: { select: { id: true, name: true, contactPerson: true } }
                    }
                })

                // 6. Criar registro de inventory automaticamente
                const inventory = await tx.inventory.create({
                    data: {
                        productId: product.id,
                        quantity: initialStock ?? 0,
                        minStock: minStock ?? 10,
                        maxStock: maxStock || null,
                        location: location?.trim() || null
                    }
                })

                // 7. Log da operação
                await this.logProductOperation(currentUserId, 'CREATE', product.id, {
                    new: {
                        name: product.name,
                        code: product.code,
                        price: Number(product.price),
                        categoryId: product.categoryId,
                        supplierId: product.supplierId
                    }
                })

                return this.formatProductResponse(product, inventory)
            })

        } catch (error: unknown) {
            if (error instanceof ApiError) throw error

            // Tratar erros específicos do Prisma
            if (error && typeof error === 'object' && 'code' in error) {
                const prismaError = error as { code: string; meta?: { target?: string[] } }
                
                if (prismaError.code === 'P2002') {
                    const field = prismaError.meta?.target?.[0]
                    if (field === 'code') {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.CODE_IN_USE, 409)
                    } else if (field === 'barcode') {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.BARCODE_IN_USE, 409)
                    }
                }
            }

            throw new ApiError('Erro ao criar produto', 500)
        }
    }

    // =================== READ ===================

    static async findMany(filters: ProductFiltersInput): Promise<ProductsListResponse> {
        try {
            const {
                search,
                categoryId,
                supplierId,
                isActive,
                hasStock,
                lowStock,
                noStock,
                minPrice,
                maxPrice,
                hasBarcode,
                createdAfter,
                createdBefore,
                page,
                limit,
                sortBy,
                sortOrder
            } = filters

            // Construir filtros WHERE (REMOVENDO lowStock - será aplicado depois)
            const where: Prisma.ProductWhereInput = {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { code: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                }),
                ...(isActive !== undefined && { isActive }),
                ...(categoryId && { categoryId }),
                ...(supplierId && { supplierId }),
                ...(minPrice !== undefined && { price: { gte: new Prisma.Decimal(minPrice) } }),
                ...(maxPrice !== undefined && { price: { lte: new Prisma.Decimal(maxPrice) } }),
                ...(hasBarcode !== undefined && hasBarcode && { barcode: { not: null } }),
                ...(hasBarcode !== undefined && !hasBarcode && { barcode: null }),
                ...(createdAfter && { createdAt: { gte: createdAfter } }),
                ...(createdBefore && { createdAt: { lte: createdBefore } }),
                ...(hasStock && { inventory: { quantity: { gt: 0 } } }),
                ...(noStock && { inventory: { quantity: 0 } })
            }

            // Definir ordenação
            const orderBy = this.buildProductOrderBy(sortBy, sortOrder)

            // Buscar produtos
            let allProducts = await prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                },
                orderBy
            })

            // Aplicar filtro lowStock EM JAVASCRIPT (pós-query)
            if (lowStock) {
                allProducts = allProducts.filter(product => 
                    product.inventory && product.inventory.quantity <= product.inventory.minStock
                )
            }

            // Aplicar paginação APÓS o filtro
            const total = allProducts.length
            const products = allProducts.slice((page - 1) * limit, page * limit)

            // Calcular informações de paginação
            const pages = Math.ceil(total / limit)
            const hasNext = page < pages
            const hasPrev = page > 1

            // Obter summary
            const summary = await this.getProductsSummary()

            return {
                data: products.map(product => this.formatProductResponse(product, product.inventory)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                    hasNext,
                    hasPrev
                },
                filters,
                summary
            }

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos', 500)
        }
    }

    static async findById(id: number, includeStats: boolean = false): Promise<ProductResponse | ProductWithStats> {
        try {
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } },
                    ...(includeStats && {
                        saleItems: {
                            where: { sale: { status: 'COMPLETED' } },
                            select: {
                                quantity: true,
                                total: true,
                                sale: { select: { saleDate: true } }
                            }
                        }
                    })
                }
            })

            if (!product) {
                throw new ApiError(PRODUCT_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            const baseProduct = this.formatProductResponse(product, product.inventory)

            if (includeStats && 'saleItems' in product) {
                const stats = this.calculateProductStats(product.saleItems)
                return { ...baseProduct, stats }
            }

            return baseProduct

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar produto', 500)
        }
    }

    static async findByCode(code: string): Promise<ProductResponse> {
        try {
            const formattedCode = formatProductCode(code)
            
            const product = await prisma.product.findUnique({
                where: { code: formattedCode },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                }
            })

            if (!product) {
                throw new ApiError(PRODUCT_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return this.formatProductResponse(product, product.inventory)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar produto por código', 500)
        }
    }

    // =================== UPDATE ===================

    static async update(id: number, data: UpdateProductInput, currentUserId: number): Promise<ProductResponse> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Verificar se produto existe
                const existingProduct = await tx.product.findUnique({
                    where: { id },
                    include: {
                        category: { select: { id: true, name: true, description: true } },
                        supplier: { select: { id: true, name: true, contactPerson: true } },
                        inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                    }
                })

                if (!existingProduct) {
                    throw new ApiError(PRODUCT_ERROR_MESSAGES.NOT_FOUND, 404)
                }

                // 2. Validar categoria se alterando
                if (data.categoryId && data.categoryId !== existingProduct.categoryId) {
                    const category = await tx.category.findUnique({
                        where: { id: data.categoryId }
                    })

                    if (!category) {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.CATEGORY_NOT_FOUND, 404)
                    }

                    if (!category.isActive) {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.CATEGORY_INACTIVE, 400)
                    }
                }

                // 3. Validar fornecedor se alterando
                if (data.supplierId !== undefined && data.supplierId !== existingProduct.supplierId) {
                    if (data.supplierId) {
                        const supplier = await tx.supplier.findUnique({
                            where: { id: data.supplierId }
                        })

                        if (!supplier) {
                            throw new ApiError(PRODUCT_ERROR_MESSAGES.SUPPLIER_NOT_FOUND, 404)
                        }

                        if (!supplier.isActive) {
                            throw new ApiError(PRODUCT_ERROR_MESSAGES.SUPPLIER_INACTIVE, 400)
                        }
                    }
                }

                // 4. Validar código único se alterando
                if (data.code && data.code !== existingProduct.code) {
                    const formattedCode = formatProductCode(data.code)
                    await this.validateUniqueCode(formattedCode, id)
                    data.code = formattedCode
                }

                // 5. Validar código de barras único se alterando
                if (data.barcode !== undefined && data.barcode !== existingProduct.barcode) {
                    if (data.barcode) {
                        await this.validateUniqueBarcode(data.barcode, id)
                    }
                }

                // 6. Preparar dados para atualização
                const updateData: Prisma.ProductUpdateInput = {
                    ...(data.name && { name: data.name.trim() }),
                    ...(data.description !== undefined && { description: data.description?.trim() || null }),
                    ...(data.price && { price: new Prisma.Decimal(data.price) }),
                    ...(data.code && { code: data.code }),
                    ...(data.barcode !== undefined && { barcode: data.barcode || null }),
                    ...(data.categoryId && { categoryId: data.categoryId }),
                    ...(data.supplierId !== undefined && { supplierId: data.supplierId || null }),
                    ...(data.isActive !== undefined && { isActive: data.isActive })
                }

                // 7. Atualizar produto
                const updatedProduct = await tx.product.update({
                    where: { id },
                    data: updateData,
                    include: {
                        category: { select: { id: true, name: true, description: true } },
                        supplier: { select: { id: true, name: true, contactPerson: true } },
                        inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                    }
                })

                // 8. Log da operação
                await this.logProductOperation(currentUserId, 'UPDATE', id, {
                    old: {
                        name: existingProduct.name,
                        code: existingProduct.code,
                        price: Number(existingProduct.price),
                        categoryId: existingProduct.categoryId,
                        supplierId: existingProduct.supplierId
                    },
                    new: {
                        name: updatedProduct.name,
                        code: updatedProduct.code,
                        price: Number(updatedProduct.price),
                        categoryId: updatedProduct.categoryId,
                        supplierId: updatedProduct.supplierId
                    }
                })

                return this.formatProductResponse(updatedProduct, updatedProduct.inventory)
            })

        } catch (error: unknown) {
            if (error instanceof ApiError) throw error

            if (error && typeof error === 'object' && 'code' in error) {
                const prismaError = error as { code: string; meta?: { target?: string[] } }
                
                if (prismaError.code === 'P2002') {
                    const field = prismaError.meta?.target?.[0]
                    if (field === 'code') {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.CODE_IN_USE, 409)
                    } else if (field === 'barcode') {
                        throw new ApiError(PRODUCT_ERROR_MESSAGES.BARCODE_IN_USE, 409)
                    }
                }
            }

            throw new ApiError('Erro ao atualizar produto', 500)
        }
    }

    // =================== DELETE (SOFT DELETE) ===================

    static async delete(id: number, currentUserId: number, reason?: string): Promise<void> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Verificar se produto existe
                const product = await tx.product.findUnique({
                    where: { id },
                    include: {
                        _count: {
                            select: {
                                saleItems: true,
                                InventoryMovement: true
                            }
                        }
                    }
                })

                if (!product) {
                    throw new ApiError(PRODUCT_ERROR_MESSAGES.NOT_FOUND, 404)
                }

                // 2. Verificar se produto pode ser excluído
                if (product._count.saleItems > 0 || product._count.InventoryMovement > 0) {
                    throw new ApiError(PRODUCT_ERROR_MESSAGES.PRODUCT_IN_USE, 400)
                }

                // 3. Soft delete (desativar produto)
                await tx.product.update({
                    where: { id },
                    data: { isActive: false }
                })

                // 4. Log da operação
                await this.logProductOperation(currentUserId, 'DELETE', id, {
                    reason,
                    old: {
                        name: product.name,
                        code: product.code,
                        price: Number(product.price),
                        isActive: product.isActive
                    }
                })
            })

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao excluir produto', 500)
        }
    }

    // =================== SEARCH AND FILTERS ===================

    static async search(searchParams: ProductSearchInput): Promise<ProductResponse[]> {
        try {
            const { q, categoryId, limit, includeInactive, withStock } = searchParams

            const products = await prisma.product.findMany({
                where: {
                    ...(includeInactive ? {} : { isActive: true }),
                    ...(categoryId && { categoryId }),
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { code: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    ...(withStock && {
                        inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                    })
                }
            })

            return products.map(product => {
                // Verificar se inventory existe quando withStock = true
                const inventory = withStock && 'inventory' in product ? product.inventory : undefined
                return this.formatProductResponse(product, inventory)
            })

        } catch (error) {
            throw new ApiError('Erro na busca de produtos', 500)
        }
    }

    static async getActiveProducts(): Promise<ProductResponse[]> {
        try {
            const products = await prisma.product.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                }
            })

            return products.map(product => this.formatProductResponse(product, product.inventory))

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos ativos', 500)
        }
    }

    static async getProductsByCategory(categoryId: number): Promise<ProductResponse[]> {
        try {
            const products = await prisma.product.findMany({
                where: {
                    categoryId,
                    isActive: true
                },
                orderBy: { name: 'asc' },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                }
            })

            return products.map(product => this.formatProductResponse(product, product.inventory))

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos por categoria', 500)
        }
    }

    static async getProductsBySupplier(supplierId: number): Promise<ProductResponse[]> {
        try {
            const products = await prisma.product.findMany({
                where: {
                    supplierId,
                    isActive: true
                },
                orderBy: { name: 'asc' },
                include: {
                    category: { select: { id: true, name: true, description: true } },
                    supplier: { select: { id: true, name: true, contactPerson: true } },
                    inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                }
            })

            return products.map(product => this.formatProductResponse(product, product.inventory))

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos por fornecedor', 500)
        }
    }

    // =================== ANALYTICS ===================

    static async getStatistics(): Promise<ProductStatsResponse> {
        try {
            const [
                totalProducts,
                activeProducts,
                productsWithSales,
                productsByCategory,
                productsBySupplier,
                recentProducts
            ] = await Promise.all([
                prisma.product.count(),
                prisma.product.count({ where: { isActive: true } }),
                prisma.product.findMany({
                    where: { 
                        isActive: true,
                        saleItems: { some: { sale: { status: 'COMPLETED' } } }
                    },
                    include: {
                        saleItems: {
                            where: { sale: { status: 'COMPLETED' } },
                            select: { quantity: true, total: true }
                        }
                    },
                    orderBy: {
                        saleItems: { _count: 'desc' }
                    },
                    take: 10
                }),
                prisma.product.groupBy({
                    by: ['categoryId'],
                    _count: { categoryId: true },
                    where: { isActive: true }
                }),
                prisma.product.groupBy({
                    by: ['supplierId'],
                    _count: { supplierId: true },
                    where: { 
                        isActive: true,
                        supplierId: { not: null }
                    }
                }),
                prisma.product.findMany({
                    where: { isActive: true },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        category: { select: { id: true, name: true, description: true } },
                        supplier: { select: { id: true, name: true, contactPerson: true } },
                        inventory: { select: { quantity: true, minStock: true, maxStock: true, location: true } }
                    }
                })
            ])

            // BUSCA SEPARADA para produtos com estoque baixo usando SQL bruto
            const lowStockProducts = await prisma.$queryRaw<Array<{
                id: number
                name: string
                code: string
                quantity: number
                minStock: number
            }>>`
                SELECT p.id, p.name, p.code, i.quantity, i."minStock"
                FROM products p
                INNER JOIN inventory i ON p.id = i."productId"
                WHERE p."isActive" = true AND i.quantity <= i."minStock"
                ORDER BY i.quantity ASC
                LIMIT 10
            `

            // Calcular estatísticas
            const inactiveProducts = totalProducts - activeProducts

            const totalInventoryValue = await prisma.product.aggregate({
                where: { isActive: true },
                _sum: { price: true }
            })

            const averagePrice = await prisma.product.aggregate({
                where: { isActive: true },
                _avg: { price: true }
            })

            // Top produtos mais vendidos
            const topSellingProducts = productsWithSales.map(product => {
                const totalSales = product.saleItems.reduce((sum, item) => sum + item.quantity, 0)
                const revenue = product.saleItems.reduce((sum, item) => sum + Number(item.total), 0)
                
                return {
                    id: product.id,
                    name: product.name,
                    code: product.code,
                    totalSales,
                    revenue
                }
            }).slice(0, 10)

            // Produtos com estoque baixo (já formatado da query)
            const lowStockList = lowStockProducts.map(product => ({
                id: product.id,
                name: product.name,
                code: product.code,
                currentStock: product.quantity,
                minStock: product.minStock
            }))

            // Buscar nomes das categorias e fornecedores
            const [categories, suppliers] = await Promise.all([
                prisma.category.findMany({ where: { isActive: true } }),
                prisma.supplier.findMany({ where: { isActive: true } })
            ])

            const categoryMap = categories.reduce((acc, cat) => {
                acc[cat.id] = cat.name
                return acc
            }, {} as Record<number, string>)

            const supplierMap = suppliers.reduce((acc, sup) => {
                acc[sup.id] = sup.name
                return acc
            }, {} as Record<number, string>)

            const productsByCategoryNamed = productsByCategory.reduce((acc, item) => {
                const categoryName = categoryMap[item.categoryId] || 'Categoria Desconhecida'
                acc[categoryName] = item._count.categoryId
                return acc
            }, {} as Record<string, number>)

            const productsBySupplierNamed = productsBySupplier.reduce((acc, item) => {
                const supplierId = item.supplierId
                const supplierName = supplierId ? 
                    (supplierMap[supplierId] || 'Fornecedor Desconhecido') : 
                    'Sem Fornecedor'
                    
                acc[supplierName] = item._count.supplierId
                return acc
            }, {} as Record<string, number>)

            return {
                totalProducts,
                activeProducts,
                inactiveProducts,
                averagePrice: Number(averagePrice._avg.price) || 0,
                totalInventoryValue: Number(totalInventoryValue._sum.price) || 0,
                topSellingProducts,
                lowStockProducts: lowStockList,
                productsByCategory: productsByCategoryNamed,
                productsBySupplier: productsBySupplierNamed,
                recentProducts: recentProducts.map(product => 
                    this.formatProductResponse(product, product.inventory || undefined)
                )
            }

        } catch (error) {
            throw new ApiError('Erro ao obter estatísticas de produtos', 500)
        }
    }

    // =================== BULK OPERATIONS ===================

    static async bulkImport(data: BulkImportInput, currentUserId: number): Promise<{ success: number; errors: string[] }> {
        try {
            const results = { success: 0, errors: [] as string[] }

            for (const productData of data.products) {
                try {
                    await this.create({
                        ...productData,
                        initialStock: 0,
                        minStock: 10
                    }, currentUserId)
                    results.success++
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
                    results.errors.push(`${productData.code}: ${errorMessage}`)
                }
            }

            return results

        } catch (error) {
            throw new ApiError('Erro na importação em lote', 500)
        }
    }

    // =================== VALIDATION HELPERS ===================

    static async checkCodeAvailability(data: CheckCodeInput): Promise<{ available: boolean }> {
        try {
            const formattedCode = formatProductCode(data.code)
            
            const existingProduct = await prisma.product.findUnique({
                where: { code: formattedCode },
                select: { id: true }
            })

            // Garantir que sempre retorna boolean
            let available: boolean
            
            if (!existingProduct) {
                available = true
            } else if (data.excludeId && existingProduct.id === data.excludeId) {
                available = true
            } else {
                available = false
            }
            
            return { available }

        } catch (error) {
            throw new ApiError('Erro ao verificar disponibilidade do código', 500)
        }
    }

    // =================== PRIVATE METHODS ===================

    private static formatProductResponse(product: any, inventory?: any): ProductResponse {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            code: product.code,
            barcode: product.barcode,
            categoryId: product.categoryId,
            supplierId: product.supplierId,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            category: product.category,
            supplier: product.supplier,
            ...(inventory && {
                inventory: {
                    quantity: inventory.quantity,
                    minStock: inventory.minStock,
                    maxStock: inventory.maxStock,
                    location: inventory.location,
                    isLowStock: inventory.quantity <= inventory.minStock
                }
            })
        }
    }

    private static calculateProductStats(saleItems: any[]) {
        const totalSales = saleItems.length
        const totalRevenue = saleItems.reduce((sum, item) => sum + Number(item.total), 0)
        const totalQuantitySold = saleItems.reduce((sum, item) => sum + item.quantity, 0)
        const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0
        
        const lastSale = saleItems.reduce((latest, item) => {
            return !latest || item.sale.saleDate > latest ? item.sale.saleDate : latest
        }, null)

        return {
            totalSales,
            totalRevenue,
            totalQuantitySold,
            averageSalePrice,
            lastSaleDate: lastSale,
            isTopSelling: totalSales > 10 // Critério configurável
        }
    }

    private static buildProductOrderBy(sortBy: string, sortOrder: string): Prisma.ProductOrderByWithRelationInput {
        const order = sortOrder as 'asc' | 'desc'
        
        switch (sortBy) {
            case 'name':
                return { name: order }
            case 'code':
                return { code: order }
            case 'price':
                return { price: order }
            case 'categoryName':
                return { category: { name: order } }
            case 'supplierName':
                return { supplier: { name: order } }
            case 'createdAt':
                return { createdAt: order }
            case 'updatedAt':
                return { updatedAt: order }
            case 'stock':
                return { inventory: { quantity: order } }
            default:
                return { name: 'asc' }
        }
    }

    private static async getProductsSummary() {
        const [total, active, totalValue] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.product.aggregate({
                where: { isActive: true },
                _sum: { price: true }
            })
        ])

        // Consultas SQL brutas para estoque
        const lowStockCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM products p
            INNER JOIN inventory i ON p.id = i."productId"
            WHERE p."isActive" = true AND i.quantity <= i."minStock"
        `

        const outOfStockCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM products p
            INNER JOIN inventory i ON p.id = i."productId"
            WHERE p."isActive" = true AND i.quantity = 0
        `

        return {
            totalProducts: total,
            activeProducts: active,
            inactiveProducts: total - active,
            lowStockProducts: Number(lowStockCount[0]?.count) || 0,
            outOfStockProducts: Number(outOfStockCount[0]?.count) || 0,
            totalValue: Number(totalValue._sum.price) || 0
        }
    }

    private static async validateUniqueCode(code: string, excludeId?: number): Promise<void> {
        const existingProduct = await prisma.product.findUnique({
            where: { code }
        })

        if (existingProduct && existingProduct.id !== excludeId) {
            throw new ApiError(PRODUCT_ERROR_MESSAGES.CODE_IN_USE, 409)
        }
    }

    private static async validateUniqueBarcode(barcode: string, excludeId?: number): Promise<void> {
        const existingProduct = await prisma.product.findUnique({
            where: { barcode }
        })

        if (existingProduct && existingProduct.id !== excludeId) {
            throw new ApiError(PRODUCT_ERROR_MESSAGES.BARCODE_IN_USE, 409)
        }
    }

    private static async logProductOperation(
        currentUserId: number,
        action: string,
        targetProductId?: number,
        data?: any
    ): Promise<void> {
        try {
            console.log(`[PRODUCT_AUDIT] User ${currentUserId} performed ${action} on product ${targetProductId}`, {
                timestamp: new Date(),
                currentUserId,
                action,
                targetProductId,
                data
            })

            // TODO: Implementar tabela de auditoria no banco se necessário

        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error)
        }
    }

    // =================== UTILITIES ===================

    static formatProductForSelect(product: any): ProductSelectOption {
        return {
            value: product.id,
            label: `${product.name} - ${product.code}`,
            code: product.code,
            price: Number(product.price),
            hasStock: product.inventory ? product.inventory.quantity > 0 : false,
            stockQuantity: product.inventory?.quantity
        }
    }

    static async checkProductExists(id: number): Promise<boolean> {
        try {
            const product = await prisma.product.findUnique({
                where: { id },
                select: { id: true }
            })
            return !!product
        } catch {
            return false
        }
    }

    static async getProductsForSelect(categoryId?: number, withStock: boolean = false): Promise<ProductSelectOption[]> {
        try {
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    ...(categoryId && { categoryId }),
                    ...(withStock && { inventory: { quantity: { gt: 0 } } })
                },
                include: {
                    inventory: { select: { quantity: true } }
                },
                orderBy: { name: 'asc' }
            })

            return products.map(this.formatProductForSelect)

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos para seleção', 500)
        }
    }
}
