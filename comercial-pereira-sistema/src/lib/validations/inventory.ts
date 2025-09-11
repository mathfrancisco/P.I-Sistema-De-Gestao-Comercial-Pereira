// lib/validations/inventory.ts
import { z } from 'zod'

// Enum para tipos de movimentação
export const MOVEMENT_TYPES = ['IN', 'OUT', 'ADJUSTMENT'] as const
export type MovementType = typeof MOVEMENT_TYPES[number]

// Schema para criação de inventory (não usado diretamente, pois é criado automaticamente com produto)
export const createInventorySchema = z.object({
    productId: z.number()
        .min(1, "ID do produto deve ser maior que 0"),

    quantity: z.number()
        .min(0, "Quantidade não pode ser negativa")
        .default(0),

    minStock: z.number()
        .min(0, "Estoque mínimo não pode ser negativo")
        .default(10),

    maxStock: z.number()
        .min(1, "Estoque máximo deve ser maior que 0")
        .optional()
        .nullable(),

    location: z.string()
        .min(2, "Localização deve ter pelo menos 2 caracteres")
        .max(100, "Localização deve ter no máximo 100 caracteres")
        .optional()
        .nullable()
})

// Schema para atualização de inventory
export const updateInventorySchema = z.object({
    quantity: z.number()
        .min(0, "Quantidade não pode ser negativa")
        .optional(),

    minStock: z.number()
        .min(0, "Estoque mínimo não pode ser negativo")
        .optional(),

    maxStock: z.number()
        .min(1, "Estoque máximo deve ser maior que 0")
        .optional()
        .nullable(),

    location: z.string()
        .min(2, "Localização deve ter pelo menos 2 caracteres")
        .max(100, "Localização deve ter no máximo 100 caracteres")
        .optional()
        .nullable()
}).refine((data) => {
    // Se ambos estão definidos, maxStock deve ser maior que minStock
    if (data.maxStock !== undefined && data.minStock !== undefined) {
        return data.maxStock > data.minStock
    }
    return true
}, {
    message: "Estoque máximo deve ser maior que o estoque mínimo",
    path: ["maxStock"]
})

// Schema para ajuste de estoque
export const stockAdjustmentSchema = z.object({
    productId: z.number()
        .min(1, "ID do produto deve ser maior que 0"),

    quantity: z.number()
        .refine((val) => val !== 0, "Quantidade do ajuste não pode ser zero"),

    reason: z.string()
        .min(3, "Motivo do ajuste deve ter pelo menos 3 caracteres")
        .max(500, "Motivo do ajuste deve ter no máximo 500 caracteres"),

    type: z.enum(['ADJUSTMENT'], {
        errorMap: () => ({ message: "Tipo deve ser ADJUSTMENT para ajustes" })
    }).default('ADJUSTMENT')
})

// Schema para movimentação de estoque
export const stockMovementSchema = z.object({
    productId: z.number()
        .min(1, "ID do produto deve ser maior que 0"),

    type: z.enum(MOVEMENT_TYPES, {
        errorMap: () => ({ message: "Tipo deve ser IN, OUT ou ADJUSTMENT" })
    }),

    quantity: z.number()
        .min(1, "Quantidade deve ser maior que 0"),

    reason: z.string()
        .min(3, "Motivo da movimentação deve ter pelo menos 3 caracteres")
        .max(500, "Motivo da movimentação deve ter no máximo 500 caracteres")
        .optional()
        .nullable(),

    saleId: z.number()
        .min(1, "ID da venda deve ser maior que 0")
        .optional()
        .nullable()
})

// Schema para filtros de inventory
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
        .optional(), // Se true, mostra apenas produtos com estoque baixo

    outOfStock: z.coerce.boolean()
        .optional(), // Se true, mostra apenas produtos sem estoque

    hasStock: z.coerce.boolean()
        .optional(), // Se true, mostra apenas produtos com estoque

    location: z.string()
        .max(100, "Localização deve ter no máximo 100 caracteres")
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
})

// Schema para filtros de movimentações
export const movementFiltersSchema = z.object({
    productId: z.coerce.number()
        .min(1, "ID do produto deve ser maior que 0")
        .optional(),

    type: z.enum([...MOVEMENT_TYPES, 'ALL'])
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
})

// Schema para parâmetros de ID
export const inventoryIdSchema = z.object({
    id: z.coerce.number()
        .min(1, "ID deve ser um número positivo")
})

export const productIdSchema = z.object({
    productId: z.coerce.number()
        .min(1, "ID do produto deve ser um número positivo")
})

// Tipos derivados dos schemas
export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>
export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>
export type MovementFiltersInput = z.infer<typeof movementFiltersSchema>
export type InventoryIdInput = z.infer<typeof inventoryIdSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>

// Schema para resposta do inventory
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

export type InventoryResponse = z.infer<typeof inventoryResponseSchema>

// Schema para resposta de movimentação
export const movementResponseSchema = z.object({
    id: z.number(),
    productId: z.number(),
    type: z.enum(MOVEMENT_TYPES),
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

export type MovementResponse = z.infer<typeof movementResponseSchema>

// Schema para lista de inventory com paginação
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

export type InventoryListResponse = z.infer<typeof inventoryListResponseSchema>

// Schema para lista de movimentações com paginação
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

export type MovementListResponse = z.infer<typeof movementListResponseSchema>

// Schema para estatísticas de inventory
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

// Constantes para validação
export const MIN_STOCK_DEFAULT = 10
export const MAX_LOCATION_LENGTH = 100
export const MAX_REASON_LENGTH = 500

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'productName'
export const DEFAULT_ORDER = 'asc'

// Helpers para validação
export const isValidMovementType = (type: string): type is MovementType => {
    return MOVEMENT_TYPES.includes(type as MovementType)
}

export const isStockOperation = (type: MovementType): boolean => {
    return type === 'IN' || type === 'OUT'
}

export const isAdjustmentOperation = (type: MovementType): boolean => {
    return type === 'ADJUSTMENT'
}