import { InventoryMovement } from '@prisma/client'

// Enums
export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

// Tipos básicos baseados no Prisma
export type InventoryMovementModel = InventoryMovement

export interface InventoryMovementBase {
  id: number
  productId: number
  type: string
  quantity: number
  reason?: string | null
  userId?: number | null
  saleId?: number | null
  createdAt: Date
}

// Tipo para resposta da API
export interface InventoryMovementResponse extends InventoryMovementBase {
  product: {
    id: number
    name: string
    code: string
  }
  user?: {
    id: number
    name: string
  } | null
  sale?: {
    id: number
    customer: {
      name: string
    }
  } | null
}

// Tipo para criação de movimentação
export interface CreateInventoryMovementRequest {
  productId: number
  type: InventoryMovementType
  quantity: number
  reason?: string | null
  userId?: number | null
  saleId?: number | null
}

// Filtros para movimentações
export interface InventoryMovementFilters {
  productId?: number
  type?: InventoryMovementType | 'ALL'
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

// Response de lista paginada
export interface InventoryMovementsListResponse {
  data: InventoryMovementResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: InventoryMovementFilters
}

// Estatísticas de movimentações
export interface InventoryMovementStats {
  totalMovements: number
  movementsByType: Record<InventoryMovementType, number>
  movementsByUser: {
    userId: number
    userName: string
    movementsCount: number
  }[]
  topProducts: {
    productId: number
    productName: string
    movementsCount: number
    totalQuantity: number
  }[]
  recentMovements: InventoryMovementResponse[]
}

// Relatório de movimentações
export interface InventoryMovementReport {
  period: {
    from: Date
    to: Date
  }
  summary: {
    totalMovements: number
    totalIn: number
    totalOut: number
    totalAdjustments: number
  }
  breakdown: {
    byType: { type: InventoryMovementType; count: number; quantity: number }[]
    byProduct: { productName: string; in: number; out: number; adjustments: number }[]
    byUser: { userName: string; movements: number }[]
    byDay: { date: string; movements: number; quantity: number }[]
  }
}

// Constantes para validação
export const INVENTORY_MOVEMENT_CONSTRAINTS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 1000000,
  REASON_MIN_LENGTH: 3,
  REASON_MAX_LENGTH: 500,
  VALID_TYPES: Object.values(InventoryMovementType)
} as const

// Funções utilitárias
export function isValidMovementType(type: string): type is InventoryMovementType {
  return Object.values(InventoryMovementType).includes(type as InventoryMovementType)
}

export function getMovementTypeLabel(type: InventoryMovementType): string {
  const labels: Record<InventoryMovementType, string> = {
    [InventoryMovementType.IN]: 'Entrada',
    [InventoryMovementType.OUT]: 'Saída',
    [InventoryMovementType.ADJUSTMENT]: 'Ajuste'
  }
  return labels[type]
}

export function getMovementTypeColor(type: InventoryMovementType): string {
  const colors: Record<InventoryMovementType, string> = {
    [InventoryMovementType.IN]: 'green',
    [InventoryMovementType.OUT]: 'red',
    [InventoryMovementType.ADJUSTMENT]: 'blue'
  }
  return colors[type]
}

export function isStockIncrease(type: InventoryMovementType): boolean {
  return type === InventoryMovementType.IN
}

export function isStockDecrease(type: InventoryMovementType): boolean {
  return type === InventoryMovementType.OUT
}

export function isStockAdjustment(type: InventoryMovementType): boolean {
  return type === InventoryMovementType.ADJUSTMENT
}
