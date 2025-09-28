/* eslint-disable @typescript-eslint/no-empty-object-type */
import { SaleStatus, PaymentMethod } from '../enums'

export interface SaleResponse {
    id: number
    customerId: number
    customerName: string
    userId: number
    userName: string
    saleDate: string
    status: SaleStatus
    subtotal: number
    discount?: number
    total: number
    paymentMethod?: PaymentMethod
    observations?: string
    items: SaleItemResponse[]
    createdAt: string
    updatedAt: string
}

export interface SaleItemResponse {
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    discount?: number
    total: number
}

export interface CreateSaleRequest {
    customerId: number
    userId: number
    saleDate?: string
    paymentMethod?: PaymentMethod
    discount?: number
    observations?: string
    items: CreateSaleItemRequest[]
}

export interface CreateSaleItemRequest {
    productId: number
    quantity: number
    unitPrice: number
    discount?: number
}

export interface UpdateSaleRequest {
    customerId?: number
    saleDate?: string
    paymentMethod?: PaymentMethod
    discount?: number
    observations?: string
}

export interface AddSaleItemRequest extends CreateSaleItemRequest {}

export interface UpdateSaleItemRequest {
    quantity?: number
    unitPrice?: number
    discount?: number
}

export interface SaleFilters {
    search?: string
    customerId?: number
    userId?: number
    status?: SaleStatus
    dateFrom?: string
    dateTo?: string
    page?: number
    size?: number
    sort?: string
}