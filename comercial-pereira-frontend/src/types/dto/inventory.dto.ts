import { MovementType } from '../enums'

export interface InventoryResponse {
    id: number
    productId: number
    productName: string
    productCode: string
    currentQuantity: number
    minQuantity?: number
    maxQuantity?: number
    location?: string
    lastMovement?: string
    status: 'OK' | 'LOW' | 'OUT_OF_STOCK' | 'EXCESS'
    createdAt: string
    updatedAt: string
}

export interface CreateInventoryRequest {
    productId: number
    currentQuantity: number
    minQuantity?: number
    maxQuantity?: number
    location?: string
}

export interface UpdateInventoryRequest {
    minQuantity?: number
    maxQuantity?: number
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
    type: MovementType
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
    type?: MovementType
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
    excessStockCount: number
    topMovingProducts: Array<{
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
    reservedQuantity: number
    status: string
}