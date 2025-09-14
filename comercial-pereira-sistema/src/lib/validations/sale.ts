// lib/validations/sale.ts
import { z } from 'zod'
import {
  SaleStatus,
  DiscountType,
  type CreateSaleRequest,
  type UpdateSaleRequest,
  type AddSaleItemRequest,
  type UpdateSaleItemRequest,
  type SaleFilters,
  type ValidateStockRequest,
  type ApplySaleDiscountRequest,
  SALE_CONSTRAINTS,
  SALE_STATUS_TRANSITIONS,
  canTransitionStatus,
  isSaleEditable,
  isSaleCancellable,
  calculateItemTotal,
  calculateSaleSubtotal,
  calculateSaleTotal,
  calculateDiscountAmount
} from '@/types/sale'

// Enums Zod baseados nos types
const SaleStatusEnum = z.enum([
  SaleStatus.DRAFT, 
  SaleStatus.PENDING, 
  SaleStatus.CONFIRMED, 
  SaleStatus.COMPLETED, 
  SaleStatus.CANCELLED, 
  SaleStatus.REFUNDED
])

const DiscountTypeEnum = z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED])

// Schema para criação de venda usando os types
export const createSaleSchema = z.object({
  customerId: z.number()
    .int()
    .min(1, "Cliente é obrigatório"),
    
  notes: z.string()
    .max(SALE_CONSTRAINTS.NOTES_MAX_LENGTH, `Notas devem ter no máximo ${SALE_CONSTRAINTS.NOTES_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  discount: z.number()
    .min(SALE_CONSTRAINTS.MIN_DISCOUNT, "Desconto não pode ser negativo")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Desconto não pode exceder o valor máximo")
    .default(0),
    
  tax: z.number()
    .min(0, "Taxa não pode ser negativa")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Taxa não pode exceder o valor máximo")
    .default(0),
    
  items: z.array(z.object({
    productId: z.number()
      .int()
      .min(1, "Produto é obrigatório"),
      
    quantity: z.number()
      .int()
      .min(SALE_CONSTRAINTS.MIN_QUANTITY, "Quantidade deve ser positiva")
      .max(SALE_CONSTRAINTS.MAX_QUANTITY, `Quantidade máxima: ${SALE_CONSTRAINTS.MAX_QUANTITY}`),
      
    unitPrice: z.number()
      .positive("Preço unitário deve ser positivo")
      .max(SALE_CONSTRAINTS.MAX_TOTAL, "Preço unitário não pode exceder o valor máximo")
      .optional(), // Se não fornecido, usar preço atual
      
    discount: z.number()
      .min(SALE_CONSTRAINTS.MIN_DISCOUNT, "Desconto do item não pode ser negativo")
      .default(0)
  }))
  .min(1, "Venda deve ter pelo menos um item")
  .refine((items) => {
    // Validar se não há produtos duplicados
    const productIds = items.map(item => item.productId)
    return new Set(productIds).size === productIds.length
  }, {
    message: "Não é possível ter produtos duplicados na mesma venda"
  })
}) satisfies z.ZodType<CreateSaleRequest>

// Schema para atualização de venda usando os types
export const updateSaleSchema = z.object({
  customerId: z.number()
    .int()
    .min(1, "Cliente deve ser válido")
    .optional(),
    
  notes: z.string()
    .max(SALE_CONSTRAINTS.NOTES_MAX_LENGTH, `Notas devem ter no máximo ${SALE_CONSTRAINTS.NOTES_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  discount: z.number()
    .min(SALE_CONSTRAINTS.MIN_DISCOUNT, "Desconto não pode ser negativo")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Desconto não pode exceder o valor máximo")
    .optional(),
    
  tax: z.number()
    .min(0, "Taxa não pode ser negativa")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Taxa não pode exceder o valor máximo")
    .optional()
}) satisfies z.ZodType<UpdateSaleRequest>

// Schema para adicionar item à venda usando os types
export const addSaleItemSchema = z.object({
  productId: z.number()
    .int()
    .min(1, "Produto é obrigatório"),
    
  quantity: z.number()
    .int()
    .min(SALE_CONSTRAINTS.MIN_QUANTITY, "Quantidade deve ser positiva")
    .max(SALE_CONSTRAINTS.MAX_QUANTITY, `Quantidade máxima: ${SALE_CONSTRAINTS.MAX_QUANTITY}`),
    
  unitPrice: z.number()
    .positive("Preço unitário deve ser positivo")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Preço unitário não pode exceder o valor máximo")
    .optional(),
    
  discount: z.number()
    .min(SALE_CONSTRAINTS.MIN_DISCOUNT, "Desconto não pode ser negativo")
    .default(0)
}) satisfies z.ZodType<AddSaleItemRequest>

// Schema para atualizar item da venda usando os types
export const updateSaleItemSchema = z.object({
  quantity: z.number()
    .int()
    .min(SALE_CONSTRAINTS.MIN_QUANTITY, "Quantidade deve ser positiva")
    .max(SALE_CONSTRAINTS.MAX_QUANTITY, `Quantidade máxima: ${SALE_CONSTRAINTS.MAX_QUANTITY}`)
    .optional(),
    
  unitPrice: z.number()
    .positive("Preço unitário deve ser positivo")
    .max(SALE_CONSTRAINTS.MAX_TOTAL, "Preço unitário não pode exceder o valor máximo")
    .optional(),
    
  discount: z.number()
    .min(SALE_CONSTRAINTS.MIN_DISCOUNT, "Desconto não pode ser negativo")
    .optional()
}).refine((data) => {
  // Pelo menos um campo deve ser fornecido
  return data.quantity !== undefined || data.unitPrice !== undefined || data.discount !== undefined
}, {
  message: "Pelo menos um campo deve ser fornecido para atualização"
}) satisfies z.ZodType<UpdateSaleItemRequest>

// Schema para busca de vendas usando os types
export const saleFiltersSchema = z.object({
  customerId: z.coerce.number()
    .int()
    .min(1, "ID do cliente deve ser válido")
    .optional(),
    
  userId: z.coerce.number()
    .int()
    .min(1, "ID do usuário deve ser válido")
    .optional(),
    
  status: SaleStatusEnum.optional(),
  
  dateFrom: z.coerce.date().optional(),
  
  dateTo: z.coerce.date().optional(),
  
  minTotal: z.coerce.number()
    .min(SALE_CONSTRAINTS.MIN_TOTAL, "Valor mínimo deve ser positivo")
    .optional(),
    
  maxTotal: z.coerce.number()
    .min(SALE_CONSTRAINTS.MIN_TOTAL, "Valor máximo deve ser positivo")
    .optional(),
    
  search: z.string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(), // Busca em notas ou nome do cliente
    
  page: z.coerce.number()
    .int()
    .min(1, "Página deve ser maior que 0")
    .default(1),
    
  limit: z.coerce.number()
    .int()
    .min(1, "Limite deve ser maior que 0")
    .max(100, "Limite máximo é 100")
    .default(10),
    
  sortBy: z.enum(['saleDate', 'total', 'status', 'createdAt'])
    .default('saleDate'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
    
  includeItems: z.coerce.boolean()
    .default(false)
}).refine((data) => {
  // Se ambas as datas estão definidas, dateFrom deve ser antes de dateTo
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom <= data.dateTo
  }
  return true
}, {
  message: "Data inicial deve ser anterior à data final",
  path: ["dateTo"]
}).refine((data) => {
  // Se ambos os valores estão definidos, minTotal deve ser menor que maxTotal
  if (data.minTotal !== undefined && data.maxTotal !== undefined) {
    return data.minTotal <= data.maxTotal
  }
  return true
}, {
  message: "Valor mínimo deve ser menor ou igual ao valor máximo",
  path: ["maxTotal"]
}) satisfies z.ZodType<SaleFilters>

// Schema para validação de estoque usando os types
export const validateStockSchema = z.object({
  items: z.array(z.object({
    productId: z.number()
      .int()
      .min(1, "ID do produto deve ser válido"),
      
    quantity: z.number()
      .int()
      .min(SALE_CONSTRAINTS.MIN_QUANTITY, "Quantidade deve ser positiva")
      .max(SALE_CONSTRAINTS.MAX_QUANTITY, `Quantidade máxima: ${SALE_CONSTRAINTS.MAX_QUANTITY}`)
  }))
  .min(1, "Deve validar pelo menos um item")
}) satisfies z.ZodType<ValidateStockRequest>

// Schema para aplicar desconto na venda usando os types
export const applySaleDiscountSchema = z.object({
  discountType: DiscountTypeEnum,
  
  discountValue: z.number()
    .positive("Valor do desconto deve ser positivo")
    .refine((value, ctx) => {
      // Se for percentual, não pode exceder 100%
      const discountType = ctx.parent?.discountType
      if (discountType === DiscountType.PERCENTAGE && value > SALE_CONSTRAINTS.MAX_DISCOUNT_PERCENTAGE) {
        return false
      }
      return true
    }, "Desconto percentual não pode exceder 100%"),
    
  reason: z.string()
    .max(SALE_CONSTRAINTS.REASON_MAX_LENGTH, `Motivo deve ter no máximo ${SALE_CONSTRAINTS.REASON_MAX_LENGTH} caracteres`)
    .optional()
}) satisfies z.ZodType<ApplySaleDiscountRequest>

// Schema para mudança de status
export const changeSaleStatusSchema = z.object({
  newStatus: SaleStatusEnum,
  reason: z.string()
    .max(SALE_CONSTRAINTS.REASON_MAX_LENGTH, `Motivo deve ter no máximo ${SALE_CONSTRAINTS.REASON_MAX_LENGTH} caracteres`)
    .optional()
})

// Schema para parâmetros de ID
export const saleIdSchema = z.object({
  id: z.coerce.number()
    .int()
    .min(1, "ID deve ser um número positivo")
})

export const saleItemIdSchema = z.object({
  itemId: z.coerce.number()
    .int()
    .min(1, "ID do item deve ser um número positivo")
})

// Tipos derivados dos schemas
export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>
export type AddSaleItemInput = z.infer<typeof addSaleItemSchema>
export type UpdateSaleItemInput = z.infer<typeof updateSaleItemSchema>
export type SaleFiltersInput = z.infer<typeof saleFiltersSchema>
export type ValidateStockInput = z.infer<typeof validateStockSchema>
export type ApplySaleDiscountInput = z.infer<typeof applySaleDiscountSchema>
export type ChangeSaleStatusInput = z.infer<typeof changeSaleStatusSchema>
export type SaleIdInput = z.infer<typeof saleIdSchema>
export type SaleItemIdInput = z.infer<typeof saleItemIdSchema>

// SCHEMAS E TIPOS DE RESPOSTA
export const saleResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  customerId: z.number(),
  total: z.number(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  status: SaleStatusEnum,
  notes: z.string().nullable(),
  saleDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string()
  }),
  customer: z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    document: z.string().nullable()
  }),
  items: z.array(z.object({
    id: z.number(),
    saleId: z.number(),
    productId: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number(),
    discount: z.number(),
    product: z.object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      category: z.object({
        id: z.number(),
        name: z.string()
      })
    })
  })).optional(),
  _count: z.object({
    items: z.number()
  }).optional()
})

export const salesListResponseSchema = z.object({
  data: z.array(saleResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: saleFiltersSchema,
  summary: z.object({
    totalSales: z.number(),
    totalRevenue: z.number(),
    averageOrderValue: z.number(),
    totalQuantity: z.number()
  })
})

export const validateStockResponseSchema = z.object({
  isValid: z.boolean(),
  totalItems: z.number(),
  validItems: z.number(),
  invalidItems: z.number(),
  validationResults: z.array(z.object({
    productId: z.number(),
    productName: z.string().optional(),
    productCode: z.string().optional(),
    isValid: z.boolean(),
    requestedQuantity: z.number(),
    availableQuantity: z.number(),
    error: z.string().optional(),
    shortfall: z.number().optional()
  })),
  summary: z.object({
    canProceed: z.boolean(),
    message: z.string()
  })
})

export const saleStatsSchema = z.object({
  totalSales: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  salesByStatus: z.record(SaleStatusEnum, z.number()),
  salesByUser: z.array(z.object({
    userId: z.number(),
    userName: z.string(),
    salesCount: z.number(),
    totalRevenue: z.number()
  })),
  topProducts: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    quantitySold: z.number(),
    revenue: z.number()
  })),
  dailySales: z.array(z.object({
    date: z.string(),
    count: z.number(),
    revenue: z.number()
  }))
})

// ===== TIPOS DE RESPOSTA EXPORTADOS =====
export type SaleResponse = z.infer<typeof saleResponseSchema>
export type SalesListResponse = z.infer<typeof salesListResponseSchema>
export type ValidateStockResponse = z.infer<typeof validateStockResponseSchema>
export type SaleStats = z.infer<typeof saleStatsSchema>

// Mensagens de erro padronizadas
export const SALE_ERROR_MESSAGES = {
  NOT_FOUND: "Venda não encontrada",
  CUSTOMER_NOT_FOUND: "Cliente não encontrado ou inativo",
  PRODUCT_NOT_FOUND: "Produto não encontrado ou inativo",
  USER_NOT_FOUND: "Usuário não encontrado",
  INSUFFICIENT_STOCK: "Estoque insuficiente",
  INVALID_STATUS_TRANSITION: "Transição de status inválida",
  SALE_NOT_EDITABLE: "Venda não pode ser editada no status atual",
  SALE_NOT_CANCELLABLE: "Venda não pode ser cancelada no status atual",
  ITEM_NOT_FOUND: "Item da venda não encontrado",
  ITEM_ALREADY_EXISTS: "Produto já está na venda",
  NO_ITEMS: "Venda deve ter pelo menos um item",
  ACCESS_DENIED: "Acesso negado a esta venda",
  INVALID_DISCOUNT: "Valor de desconto inválido",
  OPERATION_NOT_ALLOWED: "Operação não permitida para esta venda"
} as const

// Constantes para validação (re-exportadas dos types)
export { 
  SaleStatus,
  DiscountType,
  SALE_CONSTRAINTS,
  SALE_STATUS_TRANSITIONS,
  canTransitionStatus,
  isSaleEditable,
  isSaleCancellable,
  calculateItemTotal,
  calculateSaleSubtotal,
  calculateSaleTotal,
  calculateDiscountAmount
}

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'saleDate'
export const DEFAULT_ORDER = 'desc'

// Helper para validar transição de status
export const validateStatusTransition = (currentStatus: SaleStatus, newStatus: SaleStatus): string[] => {
  const errors: string[] = []
  
  if (!canTransitionStatus(currentStatus, newStatus)) {
    errors.push(`Não é possível alterar status de ${currentStatus} para ${newStatus}`)
  }
  
  return errors
}

// Helper para validar regras de negócio de venda
export const validateSaleBusinessRules = (data: CreateSaleRequest | UpdateSaleRequest): string[] => {
  const errors: string[] = []
  
  // Validar se discount não é maior que o valor da venda
  if ('discount' in data && 'items' in data && data.discount && data.items) {
    const subtotal = calculateSaleSubtotal(data.items.map(item => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0
    })))
    
    if (data.discount > subtotal) {
      errors.push("Desconto não pode ser maior que o subtotal da venda")
    }
  }
  
  return errors
}

// Helper para calcular totais da venda
export const calculateSaleTotals = (items: { quantity: number; unitPrice: number; discount?: number }[], saleDiscount = 0, tax = 0) => {
  const subtotal = calculateSaleSubtotal(items.map(item => ({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount || 0
  })))
  
  const total = calculateSaleTotal(subtotal, saleDiscount, tax)
  
  return {
    subtotal,
    discount: saleDiscount,
    tax,
    total
  }
}

// Helper para verificar se usuário pode acessar venda
export const canAccessSale = (userRole: string, userId: number, saleUserId: number): boolean => {
  // Vendedores só podem acessar suas próprias vendas
  if (userRole === 'SALESPERSON') {
    return userId === saleUserId
  }
  
  // Managers e Admins podem acessar qualquer venda
  return ['ADMIN', 'MANAGER'].includes(userRole)
}

// Helper para verificar se usuário pode editar venda
export const canEditSale = (userRole: string, userId: number, saleUserId: number, saleStatus: SaleStatus): boolean => {
  // Primeiro verificar se pode acessar
  if (!canAccessSale(userRole, userId, saleUserId)) {
    return false
  }
  
  // Depois verificar se status permite edição
  return isSaleEditable(saleStatus)
}

// Helper para verificar permissões de operações especiais
export const canPerformSpecialOperations = (userRole: string): boolean => {
  return ['ADMIN', 'MANAGER'].includes(userRole)
}

// Helper para formatar número da venda
export const formatSaleNumber = (saleId: number): string => {
  return `VD${saleId.toString().padStart(6, '0')}`
}

// Helper para obter próximo status válido
export const getNextValidStatuses = (currentStatus: SaleStatus): SaleStatus[] => {
  return SALE_STATUS_TRANSITIONS[currentStatus] || []
}