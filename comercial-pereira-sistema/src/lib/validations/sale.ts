import { z } from "zod"

// Schema para criar venda
export const createSaleSchema = z.object({
  customerId: z.number().int().positive("Cliente é obrigatório"),
  notes: z.string().max(1000, "Notas devem ter no máximo 1000 caracteres").optional().nullable(),
  discount: z.number().min(0, "Desconto não pode ser negativo").default(0),
  tax: z.number().min(0, "Taxa não pode ser negativa").default(0),
  items: z.array(z.object({
    productId: z.number().int().positive("Produto é obrigatório"),
    quantity: z.number().int().positive("Quantidade deve ser positiva").max(10000, "Quantidade máxima: 10.000"),
    unitPrice: z.number().positive("Preço unitário deve ser positivo").optional(), // Se não fornecido, usar preço atual
    discount: z.number().min(0, "Desconto do item não pode ser negativo").default(0)
  })).min(1, "Venda deve ter pelo menos um item")
})

// Schema para adicionar item à venda
export const addSaleItemSchema = z.object({
  productId: z.number().int().positive("Produto é obrigatório"),
  quantity: z.number().int().positive("Quantidade deve ser positiva").max(10000),
  unitPrice: z.number().positive("Preço unitário deve ser positivo").optional(),
  discount: z.number().min(0, "Desconto não pode ser negativo").default(0)
})

// Schema para atualizar item da venda
export const updateSaleItemSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser positiva").max(10000).optional(),
  unitPrice: z.number().positive("Preço unitário deve ser positivo").optional(),
  discount: z.number().min(0, "Desconto não pode ser negativo").optional()
})

// Schema para atualizar venda
export const updateSaleSchema = z.object({
  customerId: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional().nullable(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional()
})

// Schema para busca de vendas
export const saleSearchSchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minTotal: z.coerce.number().positive().optional(),
  maxTotal: z.coerce.number().positive().optional(),
  search: z.string().optional(), // Busca em notas ou nome do cliente
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['saleDate', 'total', 'status', 'createdAt']).default('saleDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeItems: z.coerce.boolean().default(false)
})

// Schema para validação de estoque
export const validateStockSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive()
  })).min(1, "Deve validar pelo menos um item")
})

// Schema para aplicar desconto na venda
export const applySaleDiscountSchema = z.object({
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive("Valor do desconto deve ser positivo"),
  reason: z.string().max(200, "Motivo deve ter no máximo 200 caracteres").optional()
})

export type CreateSaleData = z.infer<typeof createSaleSchema>
export type AddSaleItemData = z.infer<typeof addSaleItemSchema>
export type UpdateSaleItemData = z.infer<typeof updateSaleItemSchema>
export type UpdateSaleData = z.infer<typeof updateSaleSchema>
export type SaleSearchParams = z.infer<typeof saleSearchSchema>
export type ValidateStockData = z.infer<typeof validateStockSchema>
export type ApplySaleDiscountData = z.infer<typeof applySaleDiscountSchema>

// Funções auxiliares para cálculos
export function calculateItemTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  return (quantity * unitPrice) - discount
}

export function calculateSaleTotal(
  subtotal: number, 
  saleDiscount: number = 0, 
  tax: number = 0
): number {
  return subtotal - saleDiscount + tax
}

export function calculateSubtotal(items: { quantity: number; unitPrice: number; discount: number }[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice, item.discount), 0)
}
