// types/inventory.ts
import { Inventory } from '@prisma/client'

// Enums para movimentação
export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum UrgencyLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Tipos básicos baseados no Prisma
export type InventoryModel = Inventory

export interface InventoryBase {
  id: number
  productId: number
  quantity: number
  minStock: number
  maxStock?: number | null
  location?: string | null
  lastUpdate: Date
}

// Tipo para resposta da API
export interface InventoryResponse extends InventoryBase {
  product: {
    id: number
    name: string
    code: string
    price: number
    category: {
      id: number
      name: string
    }
    supplier?: {
      id: number
      name: string
    } | null
  }
}

// Tipo para criação de inventory
export interface CreateInventoryRequest {
  productId: number
  quantity?: number
  minStock?: number
  maxStock?: number | null
  location?: string | null
}

// Tipo para atualização de inventory
export interface UpdateInventoryRequest {
  quantity?: number
  minStock?: number
  maxStock?: number | null
  location?: string | null
}

// Ajuste de estoque
export interface StockAdjustmentRequest {
  productId: number
  quantity: number
  reason: string
  type?: MovementType.ADJUSTMENT
}

// Movimentação de estoque
export interface StockMovementRequest {
  productId: number
  type: MovementType
  quantity: number
  reason?: string | null
  saleId?: number | null
}

// Filtros para inventory
export interface InventoryFilters {
  search?: string
  categoryId?: number
  supplierId?: number
  lowStock?: boolean
  outOfStock?: boolean
  hasStock?: boolean
  location?: string
  minQuantity?: number
  maxQuantity?: number
  lastUpdateAfter?: Date
  lastUpdateBefore?: Date
  page?: number
  limit?: number
  sortBy?: 'productName' | 'quantity' | 'minStock' | 'location' | 'lastUpdate'
  sortOrder?: 'asc' | 'desc'
}

// Response de lista paginada
export interface InventoryListResponse {
  data: InventoryResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: InventoryFilters
  alerts: {
    lowStock: number
    outOfStock: number
    totalProducts: number
  }
}

// Filtros para movimentações
export interface MovementFilters {
  productId?: number
  type?: MovementType | 'ALL'
  userId?: number
  saleId?: number
  reason?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'productName' | 'type' | 'quantity'
  sortOrder?: 'asc' | 'desc'
}

// Resposta de movimentação
export interface MovementResponse {
  id: number
  productId: number
  type: MovementType
  quantity: number
  reason?: string | null
  userId?: number | null
  saleId?: number | null
  createdAt: Date
  product: {
    id: number
    name: string
    code: string
  }
  user?: {
    id: number
    name: string
  } | null
}

// Lista de movimentações
export interface MovementListResponse {
  data: MovementResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: MovementFilters
}

// Estatísticas de inventory
export interface InventoryStatsResponse {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  averageStock: number
  topProducts: {
    productId: number
    productName: string
    quantity: number
    value: number
  }[]
  lowStockProducts: {
    productId: number
    productName: string
    quantity: number
    minStock: number
    location?: string | null
  }[]
  recentMovements: MovementResponse[]
}

// Alertas de estoque
export interface InventoryAlert {
  productId: number
  productName: string
  productCode: string
  categoryName: string
  currentStock: number
  minStock: number
  maxStock?: number | null
  salesLast30Days: number
  averageDailySales: number
  daysUntilOutOfStock: number
  urgencyLevel: UrgencyLevel
  isOutOfStock: boolean
}

// Verificação de estoque
export interface StockCheckResponse {
  available: boolean
  quantity: number
  isLowStock: boolean
}

// Reserva de estoque
export interface StockReservation {
  productId: number
  quantity: number
  reservedBy: number
  reservedAt: Date
  expiresAt: Date
  saleId?: number
}

// Análise de estoque
export interface InventoryAnalysis {
  productId: number
  productName: string
  currentStock: number
  minStock: number
  maxStock?: number | null
  averageDailySales: number
  recommendedStock: number
  daysOfSupply: number
  turnoverRate: number
  lastMovementDate?: Date
  suggestions: string[]
}

// Constantes para validação
export const INVENTORY_CONSTRAINTS = {
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 1000000,
  MIN_STOCK_DEFAULT: 10,
  LOCATION_MIN_LENGTH: 2,
  LOCATION_MAX_LENGTH: 100,
  REASON_MIN_LENGTH: 3,
  REASON_MAX_LENGTH: 500,
  MOVEMENT_TYPES: [MovementType.IN, MovementType.OUT, MovementType.ADJUSTMENT] as const
} as const

// Select option para dropdowns
export interface InventorySelectOption {
  value: number
  label: string
  quantity: number
  isLowStock: boolean
}

// Tipos para formulários
export interface InventoryFormData extends UpdateInventoryRequest {}

export interface StockAdjustmentFormData extends StockAdjustmentRequest {}

export interface InventoryFormErrors {
  quantity?: string
  minStock?: string
  maxStock?: string
  location?: string
  reason?: string
}

// Funções utilitárias
export function isLowStock(inventory: InventoryBase): boolean {
  return inventory.quantity <= inventory.minStock
}

export function isOutOfStock(inventory: InventoryBase): boolean {
  return inventory.quantity === 0
}

export function getStockStatus(inventory: InventoryBase): 'OK' | 'LOW' | 'OUT' {
  if (inventory.quantity === 0) return 'OUT'
  if (inventory.quantity <= inventory.minStock) return 'LOW'
  return 'OK'
}

export function calculateDaysOfSupply(currentStock: number, averageDailySales: number): number {
  if (averageDailySales <= 0) return Infinity
  return Math.floor(currentStock / averageDailySales)
}

export function getUrgencyLevel(alert: InventoryAlert): UrgencyLevel {
  if (alert.isOutOfStock) return UrgencyLevel.CRITICAL
  if (alert.daysUntilOutOfStock <= 3) return UrgencyLevel.CRITICAL
  if (alert.daysUntilOutOfStock <= 7) return UrgencyLevel.HIGH
  if (alert.currentStock <= alert.minStock) return UrgencyLevel.MEDIUM
  return UrgencyLevel.LOW
}

export function isValidMovementType(type: string): type is MovementType {
  return Object.values(MovementType).includes(type as MovementType)
}

export function isStockOperation(type: MovementType): boolean {
  return type === MovementType.IN || type === MovementType.OUT
}

export function isAdjustmentOperation(type: MovementType): boolean {
  return type === MovementType.ADJUSTMENT
}

// Configurações de cache
export const INVENTORY_CACHE_CONFIG = {
  alerts: { ttl: 180 }, // 3 minutos
  stats: { ttl: 300 }, // 5 minutos
  movements: { ttl: 60 }, // 1 minuto
  stock_check: { ttl: 30 } // 30 segundos
} as const