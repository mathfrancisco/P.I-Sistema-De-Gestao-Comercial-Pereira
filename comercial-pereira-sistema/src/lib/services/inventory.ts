// lib/services/inventory.ts
import { prisma } from '@/lib/db'

import {
    CreateInventoryInput,
    UpdateInventoryInput,
    StockAdjustmentInput,
    StockMovementInput,
    InventoryFiltersInput,
    MovementFiltersInput,
    InventoryResponse,
    MovementResponse,
    InventoryListResponse,
    MovementListResponse,
    InventoryStatsResponse,
    MovementType,
    INVENTORY_ERROR_MESSAGES,
    MOVEMENT_TYPES,
    isValidMovementType
} from '@/lib/validations/inventory'

export class ApiError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message)
        this.name = 'ApiError'
    }
}

export class InventoryService {
    // =================== CREATE ===================

    static async createForProduct(productId: number, data?: Partial<CreateInventoryInput>): Promise<InventoryResponse> {
        try {
            // 1. Verificar se produto existe e está ativo
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    category: { select: { id: true, name: true } },
                    supplier: { select: { id: true, name: true } }
                }
            })

            if (!product) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404)
            }

            if (!product.isActive) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400)
            }

            // 2. Verificar se já existe inventory para este produto
            const existingInventory = await prisma.inventory.findUnique({
                where: { productId }
            })

            if (existingInventory) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.ALREADY_EXISTS, 409)
            }

            // 3. Criar inventory com dados fornecidos ou padrões
            const inventoryData = {
                productId,
                quantity: data?.quantity ?? 0,
                minStock: data?.minStock ?? 10,
                maxStock: data?.maxStock ?? null,
                location: data?.location ?? null
            }

            const inventory = await prisma.inventory.create({
                data: inventoryData
            })

            return this.formatInventoryResponse(inventory, product)

        } catch (error) {
            if (error instanceof ApiError) throw error

            if (error.code === 'P2002') {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.ALREADY_EXISTS, 409)
            }

            throw new ApiError('Erro ao criar registro de estoque', 500)
        }
    }

    // =================== READ ===================

    static async findMany(filters: InventoryFiltersInput): Promise<InventoryListResponse> {
        try {
            const {
                search,
                categoryId,
                supplierId,
                lowStock,
                outOfStock,
                hasStock,
                location,
                minQuantity,
                maxQuantity,
                lastUpdateAfter,
                lastUpdateBefore,
                page,
                limit,
                sortBy,
                sortOrder
            } = filters

            // Construir filtros WHERE
            const where = {
                product: {
                    isActive: true,
                    ...(search && {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' as const } },
                            { code: { contains: search, mode: 'insensitive' as const } }
                        ]
                    }),
                    ...(categoryId && { categoryId }),
                    ...(supplierId && { supplierId })
                },
                ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
                ...(minQuantity !== undefined && { quantity: { gte: minQuantity } }),
                ...(maxQuantity !== undefined && { quantity: { lte: maxQuantity } }),
                ...(lastUpdateAfter && { lastUpdate: { gte: lastUpdateAfter } }),
                ...(lastUpdateBefore && { lastUpdate: { lte: lastUpdateBefore } }),
                ...(lowStock && {
                    OR: [
                        { quantity: { lte: prisma.inventory.fields.minStock } }
                    ]
                }),
                ...(outOfStock && { quantity: 0 }),
                ...(hasStock && { quantity: { gt: 0 } })
            }

            // Definir ordenação
            const orderBy = this.buildInventoryOrderBy(sortBy, sortOrder)

            // Buscar dados e total em paralelo
            const [inventories, total, alerts] = await Promise.all([
                prisma.inventory.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy,
                    include: {
                        product: {
                            include: {
                                category: { select: { id: true, name: true } },
                                supplier: { select: { id: true, name: true } }
                            }
                        }
                    }
                }),
                prisma.inventory.count({ where }),
                this.getInventoryAlerts()
            ])

            // Calcular informações de paginação
            const pages = Math.ceil(total / limit)
            const hasNext = page < pages
            const hasPrev = page > 1

            return {
                data: inventories.map((inventory: { product: any }) =>
                    this.formatInventoryResponse(inventory, inventory.product)
                ),
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                    hasNext,
                    hasPrev
                },
                filters,
                alerts
            }

        } catch (error) {
            throw new ApiError('Erro ao buscar registros de estoque', 500)
        }
    }

    static async findByProductId(productId: number): Promise<InventoryResponse> {
        try {
            const inventory = await prisma.inventory.findUnique({
                where: { productId },
                include: {
                    product: {
                        include: {
                            category: { select: { id: true, name: true } },
                            supplier: { select: { id: true, name: true } }
                        }
                    }
                }
            })

            if (!inventory) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return this.formatInventoryResponse(inventory, inventory.product)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar registro de estoque', 500)
        }
    }

    static async findById(id: number): Promise<InventoryResponse> {
        try {
            const inventory = await prisma.inventory.findUnique({
                where: { id },
                include: {
                    product: {
                        include: {
                            category: { select: { id: true, name: true } },
                            supplier: { select: { id: true, name: true } }
                        }
                    }
                }
            })

            if (!inventory) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return this.formatInventoryResponse(inventory, inventory.product)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar registro de estoque', 500)
        }
    }

    // =================== UPDATE ===================

    static async update(id: number, data: UpdateInventoryInput, currentUserId: number): Promise<InventoryResponse> {
        try {
            // 1. Verificar se inventory existe
            const existingInventory = await prisma.inventory.findUnique({
                where: { id },
                include: {
                    product: {
                        include: {
                            category: { select: { id: true, name: true } },
                            supplier: { select: { id: true, name: true } }
                        }
                    }
                }
            })

            if (!existingInventory) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Verificar se produto está ativo
            if (!existingInventory.product.isActive) {
                throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400)
            }

            // 3. Atualizar inventory
            const updatedInventory = await prisma.inventory.update({
                where: { id },
                data: {
                    ...data,
                    lastUpdate: new Date()
                }
            })

            // 4. Log da operação
            await this.logInventoryOperation(currentUserId, 'UPDATE', id, {
                old: {
                    quantity: existingInventory.quantity,
                    minStock: existingInventory.minStock,
                    maxStock: existingInventory.maxStock,
                    location: existingInventory.location
                },
                new: data
            })

            return this.formatInventoryResponse(updatedInventory, existingInventory.product)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao atualizar registro de estoque', 500)
        }
    }

    // =================== STOCK MOVEMENTS ===================

    static async adjustStock(data: StockAdjustmentInput, currentUserId: number): Promise<InventoryResponse> {
        try {
            const { productId, quantity, reason } = data

            return await prisma.$transaction(async (tx: { product: { findUnique: (arg0: { where: { id: number }; include: { category: { select: { id: boolean; name: boolean } }; supplier: { select: { id: boolean; name: boolean } } } }) => any }; inventory: { findUnique: (arg0: { where: { productId: number } }) => any; update: (arg0: { where: { productId: number }; data: { quantity: any; lastUpdate: Date } }) => any }; inventoryMovement: { create: (arg0: { data: { productId: number; type: string; quantity: number; reason: string; userId: number } }) => any } }) => {
                // 1. Verificar se produto existe e está ativo
                const product = await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        category: { select: { id: true, name: true } },
                        supplier: { select: { id: true, name: true } }
                    }
                })

                if (!product) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404)
                }

                if (!product.isActive) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400)
                }

                // 2. Buscar estoque atual
                const inventory = await tx.inventory.findUnique({
                    where: { productId }
                })

                if (!inventory) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404)
                }

                // 3. Calcular novo estoque
                const newQuantity = inventory.quantity + quantity

                if (newQuantity < 0) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.NEGATIVE_STOCK, 400)
                }

                // 4. Atualizar estoque
                const updatedInventory = await tx.inventory.update({
                    where: { productId },
                    data: {
                        quantity: newQuantity,
                        lastUpdate: new Date()
                    }
                })

                // 5. Registrar movimentação
                await tx.inventoryMovement.create({
                    data: {
                        productId,
                        type: 'ADJUSTMENT',
                        quantity: Math.abs(quantity),
                        reason,
                        userId: currentUserId
                    }
                })

                return this.formatInventoryResponse(updatedInventory, product)
            })

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao ajustar estoque', 500)
        }
    }

    static async addStock(productId: number, quantity: number, reason: string, currentUserId: number): Promise<InventoryResponse> {
        const movement: StockMovementInput = {
            productId,
            type: 'IN',
            quantity,
            reason
        }
        return this.processStockMovement(movement, currentUserId)
    }

    static async removeStock(productId: number, quantity: number, reason: string, currentUserId: number, saleId?: number): Promise<InventoryResponse> {
        const movement: StockMovementInput = {
            productId,
            type: 'OUT',
            quantity,
            reason,
            saleId
        }
        return this.processStockMovement(movement, currentUserId)
    }

    static async processStockMovement(data: StockMovementInput, currentUserId: number): Promise<InventoryResponse> {
        try {
            const { productId, type, quantity, reason, saleId } = data

            return await prisma.$transaction(async (tx: { product: { findUnique: (arg0: { where: { id: number }; include: { category: { select: { id: boolean; name: boolean } }; supplier: { select: { id: boolean; name: boolean } } } }) => any }; inventory: { findUnique: (arg0: { where: { productId: number } }) => any; update: (arg0: { where: { productId: number }; data: { quantity: number; lastUpdate: Date } }) => any }; inventoryMovement: { create: (arg0: { data: { productId: number; type: "IN" | "OUT"; quantity: number; reason: string | null | undefined; userId: number; saleId: number | null | undefined } }) => any } }) => {
                // 1. Verificar produto
                const product = await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        category: { select: { id: true, name: true } },
                        supplier: { select: { id: true, name: true } }
                    }
                })

                if (!product) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404)
                }

                if (!product.isActive) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400)
                }

                // 2. Buscar estoque
                const inventory = await tx.inventory.findUnique({
                    where: { productId }
                })

                if (!inventory) {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404)
                }

                // 3. Calcular nova quantidade
                let newQuantity: number
                if (type === 'IN') {
                    newQuantity = inventory.quantity + quantity
                } else if (type === 'OUT') {
                    newQuantity = inventory.quantity - quantity
                    if (newQuantity < 0) {
                        throw new ApiError(INVENTORY_ERROR_MESSAGES.INSUFFICIENT_STOCK, 400)
                    }
                } else {
                    throw new ApiError(INVENTORY_ERROR_MESSAGES.INVALID_MOVEMENT_TYPE, 400)
                }

                // 4. Atualizar estoque
                const updatedInventory = await tx.inventory.update({
                    where: { productId },
                    data: {
                        quantity: newQuantity,
                        lastUpdate: new Date()
                    }
                })

                // 5. Registrar movimentação
                await tx.inventoryMovement.create({
                    data: {
                        productId,
                        type,
                        quantity,
                        reason,
                        userId: currentUserId,
                        saleId
                    }
                })

                return this.formatInventoryResponse(updatedInventory, product)
            })

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao processar movimentação de estoque', 500)
        }
    }

    // =================== MOVEMENTS HISTORY ===================

    static async getMovements(filters: MovementFiltersInput): Promise<MovementListResponse> {
        try {
            const {
                productId,
                type,
                userId,
                saleId,
                reason,
                dateFrom,
                dateTo,
                page,
                limit,
                sortBy,
                sortOrder
            } = filters

            // Construir filtros WHERE
            const where = {
                ...(productId && { productId }),
                ...(type !== 'ALL' && { type }),
                ...(userId && { userId }),
                ...(saleId && { saleId }),
                ...(reason && { reason: { contains: reason, mode: 'insensitive' as const } }),
                ...(dateFrom && { createdAt: { gte: dateFrom } }),
                ...(dateTo && { createdAt: { lte: dateTo } })
            }

            // Definir ordenação
            const orderBy = this.buildMovementOrderBy(sortBy, sortOrder)

            // Buscar dados e total em paralelo
            const [movements, total] = await Promise.all([
                prisma.inventoryMovement.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy,
                    include: {
                        product: { select: { id: true, name: true, code: true } },
                        user: { select: { id: true, name: true } }
                    }
                }),
                prisma.inventoryMovement.count({ where })
            ])

            // Calcular informações de paginação
            const pages = Math.ceil(total / limit)
            const hasNext = page < pages
            const hasPrev = page > 1

            return {
                data: movements.map(this.formatMovementResponse),
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                    hasNext,
                    hasPrev
                },
                filters
            }

        } catch (error) {
            throw new ApiError('Erro ao buscar movimentações de estoque', 500)
        }
    }

    static async getProductMovements(productId: number, limit: number = 20): Promise<MovementResponse[]> {
        try {
            const movements = await prisma.inventoryMovement.findMany({
                where: { productId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { id: true, name: true, code: true } },
                    user: { select: { id: true, name: true } }
                }
            })

            return movements.map(this.formatMovementResponse)

        } catch (error) {
            throw new ApiError('Erro ao buscar movimentações do produto', 500)
        }
    }

    // =================== ANALYTICS ===================

    static async getStatistics(): Promise<InventoryStatsResponse> {
        try {
            const [totalProducts, inventoryData, lowStockProducts, recentMovements] = await Promise.all([
                prisma.inventory.count({
                    where: { product: { isActive: true } }
                }),
                prisma.inventory.findMany({
                    where: { product: { isActive: true } },
                    include: {
                        product: { select: { name: true, price: true } }
                    }
                }),
                prisma.inventory.findMany({
                    where: {
                        product: { isActive: true },
                        quantity: { lte: prisma.inventory.fields.minStock }
                    },
                    include: {
                        product: { select: { id: true, name: true } }
                    },
                    take: 10,
                    orderBy: { quantity: 'asc' }
                }),
                prisma.inventoryMovement.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        product: { select: { id: true, name: true, code: true } },
                        user: { select: { id: true, name: true } }
                    }
                })
            ])

            // Calcular estatísticas
            const totalValue = inventoryData.reduce((sum: number, item: { quantity: number; product: { price: any } }) =>
                sum + (item.quantity * Number(item.product.price)), 0
            )

            const lowStockCount = inventoryData.filter((item: { quantity: number; minStock: number }) =>
                item.quantity <= item.minStock
            ).length

            const outOfStockCount = inventoryData.filter((item: { quantity: number }) =>
                item.quantity === 0
            ).length

            const averageStock = totalProducts > 0
                ? inventoryData.reduce((sum: any, item: { quantity: any }) => sum + item.quantity, 0) / totalProducts
                : 0

            // Top produtos por valor em estoque
            const topProducts = inventoryData
                .map((item: { productId: any; product: { name: any; price: any }; quantity: number }) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    value: item.quantity * Number(item.product.price)
                }))
                .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
                .slice(0, 10)

            return {
                totalProducts,
                totalValue,
                lowStockCount,
                outOfStockCount,
                averageStock,
                topProducts,
                lowStockProducts: lowStockProducts.map((item: { productId: any; product: { name: any }; quantity: any; minStock: any; location: any }) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    minStock: item.minStock,
                    location: item.location
                })),
                recentMovements: recentMovements.map(this.formatMovementResponse)
            }

        } catch (error) {
            throw new ApiError('Erro ao obter estatísticas de estoque', 500)
        }
    }

    static async getLowStockAlert(): Promise<InventoryResponse[]> {
        try {
            const lowStockItems = await prisma.inventory.findMany({
                where: {
                    product: { isActive: true },
                    quantity: { lte: prisma.inventory.fields.minStock }
                },
                include: {
                    product: {
                        include: {
                            category: { select: { id: true, name: true } },
                            supplier: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { quantity: 'asc' }
            })

            return lowStockItems.map((inventory: { product: any }) =>
                this.formatInventoryResponse(inventory, inventory.product)
            )

        } catch (error) {
            throw new ApiError('Erro ao buscar alertas de estoque baixo', 500)
        }
    }

    static async getOutOfStockProducts(): Promise<InventoryResponse[]> {
        try {
            const outOfStockItems = await prisma.inventory.findMany({
                where: {
                    product: { isActive: true },
                    quantity: 0
                },
                include: {
                    product: {
                        include: {
                            category: { select: { id: true, name: true } },
                            supplier: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { lastUpdate: 'desc' }
            })

            return outOfStockItems.map((inventory: { product: any }) =>
                this.formatInventoryResponse(inventory, inventory.product)
            )

        } catch (error) {
            throw new ApiError('Erro ao buscar produtos sem estoque', 500)
        }
    }

    // =================== PRIVATE METHODS ===================

    private static formatInventoryResponse(inventory: Inventory, product: any): InventoryResponse {
        return {
            id: inventory.id,
            productId: inventory.productId,
            quantity: inventory.quantity,
            minStock: inventory.minStock,
            maxStock: inventory.maxStock,
            location: inventory.location,
            lastUpdate: inventory.lastUpdate,
            product: {
                id: product.id,
                name: product.name,
                code: product.code,
                price: Number(product.price),
                category: product.category,
                supplier: product.supplier
            }
        }
    }

    private static formatMovementResponse(movement: any): MovementResponse {
        return {
            id: movement.id,
            productId: movement.productId,
            type: movement.type as MovementType,
            quantity: movement.quantity,
            reason: movement.reason,
            userId: movement.userId,
            saleId: movement.saleId,
            createdAt: movement.createdAt,
            product: movement.product,
            user: movement.user
        }
    }

    private static buildInventoryOrderBy(sortBy: string, sortOrder: string) {
        switch (sortBy) {
            case 'productName':
                return { product: { name: sortOrder } }
            case 'quantity':
                return { quantity: sortOrder }
            case 'minStock':
                return { minStock: sortOrder }
            case 'location':
                return { location: sortOrder }
            case 'lastUpdate':
                return { lastUpdate: sortOrder }
            default:
                return { product: { name: 'asc' } }
        }
    }

    private static buildMovementOrderBy(sortBy: string, sortOrder: string) {
        switch (sortBy) {
            case 'createdAt':
                return { createdAt: sortOrder }
            case 'productName':
                return { product: { name: sortOrder } }
            case 'type':
                return { type: sortOrder }
            case 'quantity':
                return { quantity: sortOrder }
            default:
                return { createdAt: 'desc' }
        }
    }

    private static async getInventoryAlerts() {
        const [lowStock, outOfStock, totalProducts] = await Promise.all([
            prisma.inventory.count({
                where: {
                    product: { isActive: true },
                    quantity: { lte: prisma.inventory.fields.minStock }
                }
            }),
            prisma.inventory.count({
                where: {
                    product: { isActive: true },
                    quantity: 0
                }
            }),
            prisma.inventory.count({
                where: { product: { isActive: true } }
            })
        ])

        return { lowStock, outOfStock, totalProducts }
    }

    private static async logInventoryOperation(
        currentUserId: number,
        action: string,
        targetInventoryId?: number,
        data?: any
    ): Promise<void> {
        try {
            console.log(`[INVENTORY_AUDIT] User ${currentUserId} performed ${action} on inventory ${targetInventoryId}`, {
                timestamp: new Date(),
                currentUserId,
                action,
                targetInventoryId,
                data
            })

            // TODO: Implementar tabela de auditoria no banco se necessário

        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error)
        }
    }

    // =================== UTILITIES ===================

    static async checkStock(productId: number): Promise<{ available: boolean; quantity: number; isLowStock: boolean }> {
        try {
            const inventory = await prisma.inventory.findUnique({
                where: { productId },
                select: { quantity: true, minStock: true }
            })

            if (!inventory) {
                return { available: false, quantity: 0, isLowStock: true }
            }

            return {
                available: inventory.quantity > 0,
                quantity: inventory.quantity,
                isLowStock: inventory.quantity <= inventory.minStock
            }

        } catch {
            return { available: false, quantity: 0, isLowStock: true }
        }
    }

    static async hasInventory(productId: number): Promise<boolean> {
        try {
            const inventory = await prisma.inventory.findUnique({
                where: { productId },
                select: { id: true }
            })
            return !!inventory
        } catch {
            return false
        }
    }

    static async reserveStock(productId: number, quantity: number): Promise<boolean> {
        // Esta função pode ser usada para sistemas mais avançados com reserva de estoque
        // Por enquanto, apenas verifica se há estoque disponível
        const { available, quantity: availableQty } = await this.checkStock(productId)
        return available && availableQty >= quantity
    }

    static formatInventoryForSelect(inventory: any): { value: number; label: string; quantity: number; isLowStock: boolean } {
        return {
            value: inventory.productId,
            label: `${inventory.product.name} - ${inventory.quantity} un.`,
            quantity: inventory.quantity,
            isLowStock: inventory.quantity <= inventory.minStock
        }
    }
}