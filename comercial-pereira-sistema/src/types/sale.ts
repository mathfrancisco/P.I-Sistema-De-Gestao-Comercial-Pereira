// types/sale.ts
import { Sale } from '@prisma/client'
import { CustomerResponse } from './customer'

// Enums
export enum SaleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

// Tipos básicos baseados no Prisma
export type SaleModel = Sale

export interface SaleBase {
  id: number
  userId: number
  customerId: number
  total: number
  discount?: number
  tax?: number
  status: SaleStatus
  notes?: string | null
  saleDate: Date
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta da API
export interface SaleResponse extends SaleBase {
  user: {
    id: number
    name: string
    role: string
  }
  customer: CustomerResponse  
  items?: SaleItemResponse[]
  _count?: {
    items: number
  }
}
// Item da venda
export interface SaleItemResponse {
  id: number
  saleId: number
  productId: number
  quantity: number
  unitPrice: number
  total: number
  discount: number
  product: {
    id: number
    name: string
    code: string
    category: {
      id: number
      name: string
    }
  }
}

// Tipo para criação de venda
export interface CreateSaleRequest {
  customerId: number
  notes?: string | null
  discount?: number
  tax?: number
  items: {
    productId: number
    quantity: number
    unitPrice?: number // Se não fornecido, usar preço atual
    discount?: number
  }[]
}

// Tipo para atualização de venda
export interface UpdateSaleRequest {
  customerId?: number
  notes?: string | null
  discount?: number
  tax?: number
}

// Tipo para adicionar item à venda
export interface AddSaleItemRequest {
  productId: number
  quantity: number
  unitPrice?: number
  discount?: number
}

// Tipo para atualizar item da venda
export interface UpdateSaleItemRequest {
  quantity?: number
  unitPrice?: number
  discount?: number
}

// Filtros para busca de vendas
export interface SaleFilters {
  customerId?: number
  userId?: number
  status?: SaleStatus
  dateFrom?: Date
  dateTo?: Date
  minTotal?: number
  maxTotal?: number
  search?: string // Busca em notas ou nome do cliente
  page?: number
  limit?: number
  sortBy?: 'saleDate' | 'total' | 'status' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  includeItems?: boolean
}

// Response de lista paginada
export interface SalesListResponse {
  data: SaleResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: SaleFilters
  summary: {
    totalSales: number
    totalRevenue: number
    averageOrderValue: number
    totalQuantity: number
  }
}

// Validação de estoque
export interface ValidateStockRequest {
  items: {
    productId: number
    quantity: number
  }[]
}

export interface ValidateStockResponse {
  valid: boolean
  errors: {
    productId: number
    productName: string
    requestedQuantity: number
    availableQuantity: number
    message: string
  }[]
}

// Aplicar desconto na venda
export interface ApplySaleDiscountRequest {
  discountType: DiscountType
  discountValue: number
  reason?: string
}

// Estatísticas de vendas
export interface SaleStats {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  salesByStatus: Record<SaleStatus, number>
  salesByUser: {
    userId: number
    userName: string
    salesCount: number
    totalRevenue: number
  }[]
  salesByCustomer: {
    customerId: number
    customerName: string
    salesCount: number
    totalRevenue: number
  }[]
  topProducts: {
    productId: number
    productName: string
    quantitySold: number
    revenue: number
  }[]
  dailySales: {
    date: string
    count: number
    revenue: number
  }[]
}

// Performance de vendas por período
export interface SalesPerformance {
  period: {
    from: Date
    to: Date
  }
  metrics: {
    totalSales: number
    totalRevenue: number
    averageOrderValue: number
    salesCount: number
    growth: {
      sales: number
      revenue: number
      orders: number
    }
  }
  topPerformers: {
    users: {
      id: number
      name: string
      sales: number
      revenue: number
    }[]
    customers: {
      id: number
      name: string
      orders: number
      revenue: number
    }[]
    products: {
      id: number
      name: string
      quantity: number
      revenue: number
    }[]
  }
}

// Carrinho de compras (para vendas em rascunho)
export interface ShoppingCart {
  customerId?: number
  items: {
    productId: number
    productName: string
    productCode: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
    availableStock: number
  }[]
  totals: {
    subtotal: number
    discount: number
    tax: number
    total: number
  }
  validationErrors: string[]
}

// Comprovante de venda
export interface SaleReceipt {
  saleId: number
  receiptNumber: string
  saleDate: Date
  customer: {
    name: string
    document?: string
    address?: string
  }
  seller: {
    name: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  totals: {
    subtotal: number
    discount: number
    tax: number
    total: number
  }
  paymentInfo?: {
    method: string
    amount: number
    change?: number
  }
  notes?: string
}

// Relatório de vendas
export interface SalesReport {
  period: {
    from: Date
    to: Date
  }
  summary: {
    totalSales: number
    totalRevenue: number
    totalQuantity: number
    averageOrderValue: number
    uniqueCustomers: number
  }
  breakdown: {
    byDay: { date: string; sales: number; revenue: number }[]
    byCategory: { categoryName: string; sales: number; revenue: number }[]
    byUser: { userName: string; sales: number; revenue: number }[]
    byStatus: { status: SaleStatus; count: number; revenue: number }[]
  }
  trends: {
    salesGrowth: number
    revenueGrowth: number
    customerGrowth: number
  }
}

// Constantes para validação
export const SALE_CONSTRAINTS = {
  MIN_TOTAL: 0.01,
  MAX_TOTAL: 999999.99,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10000,
  MIN_DISCOUNT: 0,
  MAX_DISCOUNT_PERCENTAGE: 100,
  NOTES_MAX_LENGTH: 1000,
  REASON_MAX_LENGTH: 200
} as const

// Status transitions permitidas
export const SALE_STATUS_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  [SaleStatus.DRAFT]: [SaleStatus.PENDING, SaleStatus.CANCELLED],
  [SaleStatus.PENDING]: [SaleStatus.CONFIRMED, SaleStatus.CANCELLED],
  [SaleStatus.CONFIRMED]: [SaleStatus.COMPLETED, SaleStatus.CANCELLED],
  [SaleStatus.COMPLETED]: [SaleStatus.REFUNDED],
  [SaleStatus.CANCELLED]: [],
  [SaleStatus.REFUNDED]: []
}

// Select option para dropdowns
export interface SaleSelectOption {
  value: number
  label: string
  total: number
  status: SaleStatus
  date: Date
}

// Tipos para formulários
export interface SaleFormData extends CreateSaleRequest {}

export interface SaleFormErrors {
  customerId?: string
  notes?: string
  discount?: string
  tax?: string
  items?: string
}

export interface SaleItemFormData extends AddSaleItemRequest {}

export interface SaleItemFormErrors {
  productId?: string
  quantity?: string
  unitPrice?: string
  discount?: string
}

// Funções utilitárias
export function calculateItemTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  return (quantity * unitPrice) - discount
}

export function calculateSaleSubtotal(items: { quantity: number; unitPrice: number; discount: number }[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice, item.discount), 0)
}

export function calculateSaleTotal(subtotal: number, saleDiscount: number = 0, tax: number = 0): number {
  return subtotal - saleDiscount + tax
}

export function canTransitionStatus(from: SaleStatus, to: SaleStatus): boolean {
  return SALE_STATUS_TRANSITIONS[from].includes(to)
}

export function isSaleEditable(status: SaleStatus): boolean {
  return [SaleStatus.DRAFT, SaleStatus.PENDING].includes(status)
}

export function isSaleCancellable(status: SaleStatus): boolean {
  return [SaleStatus.DRAFT, SaleStatus.PENDING, SaleStatus.CONFIRMED].includes(status)
}

export function isSaleRefundable(status: SaleStatus): boolean {
  return status === SaleStatus.COMPLETED
}

export function calculateDiscountAmount(total: number, discountType: DiscountType, discountValue: number): number {
  if (discountType === DiscountType.PERCENTAGE) {
    return total * (discountValue / 100)
  }
  return discountValue
}

export function formatSaleNumber(saleId: number): string {
  return `VD${saleId.toString().padStart(6, '0')}`
}

export function getSaleStatusLabel(status: SaleStatus): string {
  const labels: Record<SaleStatus, string> = {
    [SaleStatus.DRAFT]: 'Rascunho',
    [SaleStatus.PENDING]: 'Pendente',
    [SaleStatus.CONFIRMED]: 'Confirmada',
    [SaleStatus.COMPLETED]: 'Concluída',
    [SaleStatus.CANCELLED]: 'Cancelada',
    [SaleStatus.REFUNDED]: 'Reembolsada'
  }
  return labels[status]
}

export function getSaleStatusColor(status: SaleStatus): string {
  const colors: Record<SaleStatus, string> = {
    [SaleStatus.DRAFT]: 'gray',
    [SaleStatus.PENDING]: 'yellow',
    [SaleStatus.CONFIRMED]: 'blue',
    [SaleStatus.COMPLETED]: 'green',
    [SaleStatus.CANCELLED]: 'red',
    [SaleStatus.REFUNDED]: 'orange'
  }
  return colors[status]
}