import type { SaleStatus } from "../enums";

export interface SaleResponse {
    id: number
    total: number
    discount?: number
    tax?: number
    status: SaleStatus
    notes?: string
    saleDate: string
    createdAt: string
    updatedAt: string
    user: UserInfo
    customer: CustomerInfo
    items: SaleItemInfo[]
    itemCount: number
}

export interface UserInfo {
    id: number
    name: string
    role?: string
}

export interface CustomerInfo {
    id: number
    name: string
    type: string
    document?: string
}

export interface SaleItemInfo {
    id: number
    quantity: number
    unitPrice: number
    total: number
    discount?: number
    product: ProductInfo
}

export interface ProductInfo {
    id: number
    name: string
    code: string
    categoryName: string
}

export interface CreateSaleRequest {
    customerId: number
    notes?: string
    discount?: number
    tax?: number
    items: SaleItemRequest[]
}

export interface SaleItemRequest {
    productId: number
    quantity: number
    unitPrice?: number
    discount?: number
}

export interface UpdateSaleRequest {
    customerId?: number
    notes?: string
    discount?: number
    tax?: number
}

export interface AddSaleItemRequest {
    productId: number
    quantity: number
    unitPrice?: number
    discount?: number
}

export interface UpdateSaleItemRequest {
    quantity?: number
    unitPrice?: number
    discount?: number
}

export interface SaleFilters {
    customerId?: number
    userId?: number
    status?: SaleStatus
    dateFrom?: string
    dateTo?: string
    minTotal?: number
    maxTotal?: number
    search?: string
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    includeItems?: boolean
}
