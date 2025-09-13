export * from './user'
export * from './category'
export * from './supplier'
export * from './product'
export * from './inventory'
export * from './sale'


// Re-exportar tipos do Prisma para conveniência
export type {
  User,
  Category,
  Supplier,
  Product,
  Inventory,
  Customer,
  Sale,
  SaleItem,
  InventoryMovement
} from '@prisma/client'

// Re-exportar enums do Prisma
export {
  UserRole as PrismaUserRole,
  SaleStatus as PrismaSaleStatus,
  CustomerType as PrismaCustomerType
} from '@prisma/client'

// Tipos globais do sistema
export interface ApiResponse<T = any> {
  data?: T
  success: boolean
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface BaseFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRange {
  from: Date
  to: Date
}

export interface SelectOption<T = number> {
  value: T
  label: string
  disabled?: boolean
}

// Tipos para formulários
export interface FormError {
  field: string
  message: string
}

export interface FormState<T = any> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
}

// Tipos para cache
export interface CacheConfig {
  key: string
  ttl: number
  tags?: string[]
}

// Tipos para auditoria
export interface AuditLog {
  id: number
  userId: number
  action: string
  module: string
  resourceId?: number
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}