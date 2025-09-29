export interface InventoryResponse {
    id: number
    quantity: number
    minStock: number
    maxStock: number
    location: string
    lastUpdate: string
    createdAt: string
    updatedAt: string
    isLowStock: boolean
    isOutOfStock: boolean
    isOverstock: boolean
    status: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'

    product: {
        id: number
        name: string
        code: string
        price: number
        category: {
            id: number
            name: string
        }
        supplier: {
            id: number
            name: string
        }
    }
}

export interface CreateInventoryRequest {
    productId: number
    quantity: number
    minStock?: number
    maxStock?: number
    location?: string
}

export interface UpdateInventoryRequest {
    minStock?: number
    maxStock?: number
    location?: string
}

export interface StockAdjustmentRequest {
    productId: number
    quantity: number
    type: 'ADD' | 'REMOVE' | 'SET'
    reason: string
}

export interface MovementResponse {
    id: number
    productId: number
    productName: string
    type: string
    quantity: number
    quantityBefore: number
    quantityAfter: number
    reason?: string
    userId: number
    userName: string
    saleId?: number
    createdAt: string
}

export interface InventoryFilters {
    search?: string
    categoryId?: number
    supplierId?: number
    location?: string
    lowStock?: boolean
    outOfStock?: boolean
    hasStock?: boolean
    minQuantity?: number
    maxQuantity?: number
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface MovementFilters {
    productId?: number
    type?: string
    userId?: number
    saleId?: number
    reason?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface InventoryStatsResponse {
    totalProducts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    excessStockCount?: number
    topMovingProducts?: Array<{
        productId: number
        productName: string
        movementCount: number
    }>
}

export interface StockCheckResponse {
    productId: number
    hasStock: boolean
    currentQuantity: number
    availableQuantity: number
    reservedQuantity?: number
    status: string
}