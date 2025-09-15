// lib/validations/inventory.ts
import { z } from 'zod'
import { 
  MovementType,
  UrgencyLevel,
  type CreateInventoryRequest,
  type UpdateInventoryRequest,
  type StockAdjustmentRequest,
  type StockMovementRequest,
  type InventoryFilters,
  type MovementFilters,
  INVENTORY_CONSTRAINTS,
  isValidMovementType,
  isStockOperation,
  isAdjustmentOperation,
  isLowStock,
  isOutOfStock,
  getStockStatus
} from '@/types/inventory'

// Enum Zod baseado nos types
const MovementTypeEnum = z.enum([MovementType.IN, MovementType.OUT, MovementType.ADJUSTMENT])
const MovementTypeWithAllEnum = z.enum([MovementType.IN, MovementType.OUT, MovementType.ADJUSTMENT, 'ALL'])

// Schema para criação de inventory usando o type
export const createInventorySchema = z.object({
  productId: z.number()
    .min(1, "ID do produto deve ser maior que 0"),

  quantity: z.number()
    .min(INVENTORY_CONSTRAINTS.MIN_QUANTITY, "Quantidade não pode ser negativa")
    .max(INVENTORY_CONSTRAINTS.MAX_QUANTITY, `Quantidade não pode exceder ${INVENTORY_CONSTRAINTS.MAX_QUANTITY}`)
    .default(0),

  minStock: z.number()
    .min(INVENTORY_CONSTRAINTS.MIN_QUANTITY, "Estoque mínimo não pode ser negativo")
    .default(INVENTORY_CONSTRAINTS.MIN_STOCK_DEFAULT),

  maxStock: z.number()
    .min(1, "Estoque máximo deve ser maior que 0")
    .max(INVENTORY_CONSTRAINTS.MAX_QUANTITY, `Estoque máximo não pode exceder ${INVENTORY_CONSTRAINTS.MAX_QUANTITY}`)
    .optional()
    .nullable(),

  location: z.string()
    .min(INVENTORY_CONSTRAINTS.LOCATION_MIN_LENGTH, "Localização deve ter pelo menos 2 caracteres")
    .max(INVENTORY_CONSTRAINTS.LOCATION_MAX_LENGTH, "Localização deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
}) satisfies z.ZodType<CreateInventoryRequest>

// Schema para atualização de inventory usando o type
export const updateInventorySchema = z.object({
  quantity: z.number()
    .min(INVENTORY_CONSTRAINTS.MIN_QUANTITY, "Quantidade não pode ser negativa")
    .max(INVENTORY_CONSTRAINTS.MAX_QUANTITY, `Quantidade não pode exceder ${INVENTORY_CONSTRAINTS.MAX_QUANTITY}`)
    .optional(),

  minStock: z.number()
    .min(INVENTORY_CONSTRAINTS.MIN_QUANTITY, "Estoque mínimo não pode ser negativo")
    .optional(),

  maxStock: z.number()
    .min(1, "Estoque máximo deve ser maior que 0")
    .max(INVENTORY_CONSTRAINTS.MAX_QUANTITY, `Estoque máximo não pode exceder ${INVENTORY_CONSTRAINTS.MAX_QUANTITY}`)
    .optional()
    .nullable(),

  location: z.string()
    .min(INVENTORY_CONSTRAINTS.LOCATION_MIN_LENGTH, "Localização deve ter pelo menos 2 caracteres")
    .max(INVENTORY_CONSTRAINTS.LOCATION_MAX_LENGTH, "Localização deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
}).refine((data) => {
  // Se ambos estão definidos, maxStock deve ser maior que minStock
  if (data.maxStock != null && data.minStock != null && data.maxStock <= data.minStock) {
    return data.maxStock > data.minStock
  }
  return true
}, {
  message: "Estoque máximo deve ser maior que o estoque mínimo",
  path: ["maxStock"]
}) satisfies z.ZodType<UpdateInventoryRequest>

// Schema para ajuste de estoque usando o type
export const stockAdjustmentSchema = z.object({
  productId: z.number()
    .min(1, "ID do produto deve ser maior que 0"),

  quantity: z.number()
    .refine((val) => val !== 0, "Quantidade do ajuste não pode ser zero"),

  reason: z.string()
    .min(INVENTORY_CONSTRAINTS.REASON_MIN_LENGTH, "Motivo do ajuste deve ter pelo menos 3 caracteres")
    .max(INVENTORY_CONSTRAINTS.REASON_MAX_LENGTH, "Motivo do ajuste deve ter no máximo 500 caracteres"),

  type: z.literal(MovementType.ADJUSTMENT, {
    message: "Tipo deve ser ADJUSTMENT para ajustes"
  }).default(MovementType.ADJUSTMENT)
}) satisfies z.ZodType<StockAdjustmentRequest>

// Schema para movimentação de estoque usando o type
export const stockMovementSchema = z.object({
  productId: z.number()
    .min(1, "ID do produto deve ser maior que 0"),

  type: MovementTypeEnum.refine((type) => isValidMovementType(type), {
    message: "Tipo deve ser IN, OUT ou ADJUSTMENT"
  }),

  quantity: z.number()
    .min(1, "Quantidade deve ser maior que 0")
    .max(INVENTORY_CONSTRAINTS.MAX_QUANTITY, `Quantidade não pode exceder ${INVENTORY_CONSTRAINTS.MAX_QUANTITY}`),

  reason: z.string()
    .min(INVENTORY_CONSTRAINTS.REASON_MIN_LENGTH, "Motivo da movimentação deve ter pelo menos 3 caracteres")
    .max(INVENTORY_CONSTRAINTS.REASON_MAX_LENGTH, "Motivo da movimentação deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),

  saleId: z.number()
    .min(1, "ID da venda deve ser maior que 0")
    .optional()
    .nullable()
}) satisfies z.ZodType<StockMovementRequest>

// Schema para filtros de inventory usando o type
export const inventoryFiltersSchema = z.object({
  search: z.string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(),

  categoryId: z.coerce.number()
    .min(1, "ID da categoria deve ser maior que 0")
    .optional(),

  supplierId: z.coerce.number()
    .min(1, "ID do fornecedor deve ser maior que 0")
    .optional(),

  lowStock: z.coerce.boolean()
    .optional(),

  outOfStock: z.coerce.boolean()
    .optional(),

  hasStock: z.coerce.boolean()
    .optional(),

  location: z.string()
    .max(INVENTORY_CONSTRAINTS.LOCATION_MAX_LENGTH, "Localização deve ter no máximo 100 caracteres")
    .optional(),

  minQuantity: z.coerce.number()
    .min(0, "Quantidade mínima não pode ser negativa")
    .optional(),

  maxQuantity: z.coerce.number()
    .min(0, "Quantidade máxima não pode ser negativa")
    .optional(),

  lastUpdateAfter: z.coerce.date().optional(),

  lastUpdateBefore: z.coerce.date().optional(),

  page: z.coerce.number()
    .min(1, "Página deve ser maior que 0")
    .default(1),

  limit: z.coerce.number()
    .min(1, "Limite deve ser maior que 0")
    .max(100, "Limite máximo é 100")
    .default(20),

  sortBy: z.enum(['productName', 'quantity', 'minStock', 'location', 'lastUpdate'])
    .default('productName'),

  sortOrder: z.enum(['asc', 'desc'])
    .default('asc')
}).refine((data) => {
  // Se ambas as quantidades estão definidas, min deve ser menor que max
  if (data.minQuantity !== undefined && data.maxQuantity !== undefined) {
    return data.minQuantity <= data.maxQuantity
  }
  return true
}, {
  message: "Quantidade mínima deve ser menor ou igual à quantidade máxima",
  path: ["maxQuantity"]
}) satisfies z.ZodType<InventoryFilters>

// Schema para filtros de movimentações usando o type
export const movementFiltersSchema = z.object({
  productId: z.coerce.number()
    .min(1, "ID do produto deve ser maior que 0")
    .optional(),

  type: MovementTypeWithAllEnum
    .default('ALL'),

  userId: z.coerce.number()
    .min(1, "ID do usuário deve ser maior que 0")
    .optional(),

  saleId: z.coerce.number()
    .min(1, "ID da venda deve ser maior que 0")
    .optional(),

  reason: z.string()
    .max(100, "Motivo deve ter no máximo 100 caracteres")
    .optional(),

  dateFrom: z.coerce.date().optional(),

  dateTo: z.coerce.date().optional(),

  page: z.coerce.number()
    .min(1, "Página deve ser maior que 0")
    .default(1),

  limit: z.coerce.number()
    .min(1, "Limite deve ser maior que 0")
    .max(100, "Limite máximo é 100")
    .default(20),

  sortBy: z.enum(['createdAt', 'productName', 'type', 'quantity'])
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc'])
    .default('desc')
}) satisfies z.ZodType<MovementFilters>

// Schema para parâmetros de ID
export const inventoryIdSchema = z.object({
  id: z.coerce.number()
    .min(1, "ID deve ser um número positivo")
})

export const productIdSchema = z.object({
  productId: z.coerce.number()
    .min(1, "ID do produto deve ser um número positivo")
})

// Tipos derivados dos schemas (usando os types existentes)
export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>
export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>
export type MovementFiltersInput = z.infer<typeof movementFiltersSchema>
export type InventoryIdInput = z.infer<typeof inventoryIdSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>

// SCHEMAS E TIPOS DE RESPOSTA - NOVOS EXPORTS
// Schema para resposta do inventory (baseado no type do @/types/inventory)
export const inventoryResponseSchema = z.object({
  id: z.number(),
  productId: z.number(),
  quantity: z.number(),
  minStock: z.number(),
  maxStock: z.number().nullable(),
  location: z.string().nullable(),
  lastUpdate: z.date(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    price: z.number(),
    category: z.object({
      id: z.number(),
      name: z.string()
    }),
    supplier: z.object({
      id: z.number(),
      name: z.string()
    }).nullable()
  })
})

// Schema para resposta de movimentação (baseado no type do @/types/inventory)
export const movementResponseSchema = z.object({
  id: z.number(),
  productId: z.number(),
  type: MovementTypeEnum,
  quantity: z.number(),
  reason: z.string().nullable(),
  userId: z.number().nullable(),
  saleId: z.number().nullable(),
  createdAt: z.date(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string()
  }),
  user: z.object({
    id: z.number(),
    name: z.string()
  }).nullable()
})

// Schema para lista de inventory com paginação (baseado no type do @/types/inventory)
export const inventoryListResponseSchema = z.object({
  data: z.array(inventoryResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: inventoryFiltersSchema,
  alerts: z.object({
    lowStock: z.number(),
    outOfStock: z.number(),
    totalProducts: z.number()
  })
})

// Schema para lista de movimentações com paginação (baseado no type do @/types/inventory)
export const movementListResponseSchema = z.object({
  data: z.array(movementResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: movementFiltersSchema
})

// Schema para estatísticas de inventory (baseado no type do @/types/inventory)
export const inventoryStatsSchema = z.object({
  totalProducts: z.number(),
  totalValue: z.number(),
  lowStockCount: z.number(),
  outOfStockCount: z.number(),
  averageStock: z.number(),
  topProducts: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    quantity: z.number(),
    value: z.number()
  })),
  lowStockProducts: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    quantity: z.number(),
    minStock: z.number(),
    location: z.string().nullable()
  })),
  recentMovements: z.array(movementResponseSchema)
})

// ===== TIPOS DE RESPOSTA EXPORTADOS =====
export type InventoryResponse = z.infer<typeof inventoryResponseSchema>
export type MovementResponse = z.infer<typeof movementResponseSchema>
export type InventoryListResponse = z.infer<typeof inventoryListResponseSchema>
export type MovementListResponse = z.infer<typeof movementListResponseSchema>
export type InventoryStatsResponse = z.infer<typeof inventoryStatsSchema>

// Mensagens de erro padronizadas
export const INVENTORY_ERROR_MESSAGES = {
  NOT_FOUND: "Registro de estoque não encontrado",
  PRODUCT_NOT_FOUND: "Produto não encontrado",
  PRODUCT_INACTIVE: "Produto está inativo",
  ALREADY_EXISTS: "Registro de estoque já existe para este produto",
  INSUFFICIENT_STOCK: "Quantidade insuficiente em estoque",
  NEGATIVE_STOCK: "Operação resultaria em estoque negativo",
  INVALID_MOVEMENT_TYPE: "Tipo de movimentação inválido",
  ADJUSTMENT_ZERO: "Ajuste não pode ser zero",
  INVALID_QUANTITY: "Quantidade deve ser maior que zero",
  SALE_NOT_FOUND: "Venda não encontrada",
  USER_NOT_FOUND: "Usuário não encontrado",
  OPERATION_NOT_ALLOWED: "Operação não permitida para este produto"
} as const

// Constantes para validação (re-exportadas dos types)
export { 
  MovementType,
  UrgencyLevel,
  INVENTORY_CONSTRAINTS,
  isValidMovementType,
  isStockOperation,
  isAdjustmentOperation,
  isLowStock,
  isOutOfStock,
  getStockStatus
}

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'productName'
export const DEFAULT_ORDER = 'asc'

// Helper para validar movimentação de estoque
export const validateStockMovement = (movement: StockMovementRequest, currentStock: number): string[] => {
  const errors: string[] = []
  
  // Validar tipo de movimentação
  if (!isValidMovementType(movement.type)) {
    errors.push("Tipo de movimentação inválido")
  }
  
  // Para movimentações de saída, verificar se há estoque suficiente
  if (movement.type === MovementType.OUT && movement.quantity > currentStock) {
    errors.push("Quantidade insuficiente em estoque")
  }
  
  // Para movimentações de venda, deve ter saleId
  if (movement.type === MovementType.OUT && movement.reason === "Venda" && !movement.saleId) {
    errors.push("Movimentação de venda deve ter ID da venda")
  }
  
  return errors
}

// Helper para validar ajuste de estoque
export const validateStockAdjustment = (adjustment: StockAdjustmentRequest, currentStock: number): string[] => {
  const errors: string[] = []
  
  // Verificar se o ajuste não resultará em estoque negativo
  if (currentStock + adjustment.quantity < 0) {
    errors.push("Ajuste resultaria em estoque negativo")
  }
  
  // Validar motivo para ajustes grandes
  if (Math.abs(adjustment.quantity) > currentStock && adjustment.reason.length < 20) {
    errors.push("Ajustes grandes requerem motivo mais detalhado")
  }
  
  return errors
}

// Helper para calcular dias até estoque zerado
export const calculateDaysUntilOutOfStock = (currentStock: number, averageDailySales: number): number => {
  if (averageDailySales <= 0) return Infinity
  return Math.floor(currentStock / averageDailySales)
}

// Helper para determinar nível de urgência de alerta
export const getAlertUrgencyLevel = (currentStock: number, minStock: number, averageDailySales: number): UrgencyLevel => {
  if (currentStock === 0) return UrgencyLevel.CRITICAL
  
  const daysUntilEmpty = calculateDaysUntilOutOfStock(currentStock, averageDailySales)
  
  if (daysUntilEmpty <= 3) return UrgencyLevel.CRITICAL
  if (daysUntilEmpty <= 7) return UrgencyLevel.HIGH
  if (currentStock <= minStock) return UrgencyLevel.MEDIUM
  
  return UrgencyLevel.LOW
}

// Helper para validar se inventory pode ser excluído
export const canDeleteInventory = (inventory: InventoryResponse): boolean => {
  // Inventory não pode ser excluído se tiver movimentações recentes
  // Esta verificação seria feita no service
  return inventory.quantity === 0
}

// Helper para calcular valor total do estoque
export const calculateInventoryValue = (inventory: InventoryResponse): number => {
  return inventory.quantity * inventory.product.price
}

// Helper para determinar se precisa reposição
export const needsReplenishment = (inventory: InventoryResponse, averageDailySales: number = 0): boolean => {
  const isLow = isLowStock(inventory)
  const daysLeft = averageDailySales > 0 ? calculateDaysUntilOutOfStock(inventory.quantity, averageDailySales) : Infinity
  
  return isLow || daysLeft <= 7
}

// Validação de regras de negócio para inventory
export const validateInventoryBusinessRules = (data: CreateInventoryRequest | UpdateInventoryRequest): string[] => {
  const errors: string[] = []
  
  // Estoque máximo deve ser maior que mínimo
  if (typeof data.maxStock === 'number' && typeof data.minStock === 'number' && data.maxStock <= data.minStock) {
    errors.push("Estoque máximo deve ser maior que o estoque mínimo")
  }
  
  // Localização não pode ser apenas números
  const location = data.location?.trim()
  if (location && /^\d+$/.test(location)) {
    errors.push("Localização não pode ser apenas números")
  }
  
  return errors
}