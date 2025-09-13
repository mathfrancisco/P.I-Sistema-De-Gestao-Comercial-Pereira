import { SaleItem } from '@prisma/client'

// Tipos básicos baseados no Prisma
export type SaleItemModel = SaleItem

export interface SaleItemBase {
  id: number
  saleId: number
  productId: number
  quantity: number
  unitPrice: number
  total: number
  discount: number
}

// Tipo para resposta da API
export interface SaleItemResponse extends SaleItemBase {
  product: {
    id: number
    name: string
    code: string
    category: {
      id: number
      name: string
    }
  }
  sale?: {
    id: number
    status: string
    saleDate: Date
  }
}

// Tipo para criação de item
export interface CreateSaleItemRequest {
  saleId: number
  productId: number
  quantity: number
  unitPrice: number
  discount?: number
}

// Tipo para atualização de item
export interface UpdateSaleItemRequest {
  quantity?: number
  unitPrice?: number
  discount?: number
}

// Análise de itens vendidos
export interface SaleItemAnalysis {
  productId: number
  productName: string
  productCode: string
  categoryName: string
  totalQuantitySold: number
  totalRevenue: number
  averageUnitPrice: number
  averageDiscount: number
  salesCount: number
  trend: 'UP' | 'DOWN' | 'STABLE'
}

// Constantes para validação
export const SALE_ITEM_CONSTRAINTS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10000,
  MIN_UNIT_PRICE: 0.01,
  MAX_UNIT_PRICE: 999999.99,
  MIN_DISCOUNT: 0,
  MAX_DISCOUNT: 999999.99
} as const

// Funções utilitárias
export function calculateItemTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  return (quantity * unitPrice) - discount
}

export function calculateItemSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

export function getItemDiscountPercentage(subtotal: number, discount: number): number {
  if (subtotal === 0) return 0
  return (discount / subtotal) * 100
}
