// lib/validations/products.ts
import { z } from 'zod'

// Validação de código de produto (alfanumérico, sem espaços)
const productCodeRegex = /^[A-Z0-9-_]{3,20}$/

// Validação de preço (deve ser positivo)
const priceValidation = z.number()
    .positive("Preço deve ser maior que zero")
    .max(999999.99, "Preço deve ser menor que R$ 999.999,99")

// Schema para criação de produto
export const createProductSchema = z.object({
    name: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres")
        .max(255, "Nome deve ter no máximo 255 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ0-9\s&.,()-]+$/, "Nome contém caracteres inválidos"),

    description: z.string()
        .min(10, "Descrição deve ter pelo menos 10 caracteres")
        .max(1000, "Descrição deve ter no máximo 1000 caracteres")
        .optional()
        .nullable(),

    price: priceValidation,

    code: z.string()
        .regex(productCodeRegex, "Código deve conter apenas letras maiúsculas, números, hífen e underscore (3-20 caracteres)")
        .transform(str => str.toUpperCase()),

    barcode: z.string()
        .regex(/^\d{8,14}$/, "Código de barras deve conter apenas números (8-14 dígitos)")
        .optional()
        .nullable(),

    categoryId: z.number()
        .min(1, "Categoria é obrigatória"),

    supplierId: z.number()
        .min(1, "ID do fornecedor deve ser maior que 0")
        .optional()
        .nullable(),

    isActive: z.boolean().default(true),

    // Configurações iniciais de estoque
    initialStock: z.number()
        .min(0, "Estoque inicial não pode ser negativo")
        .default(0)
        .optional(),

    minStock: z.number()
        .min(0, "Estoque mínimo não pode ser negativo")
        .default(10)
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
})

// Schema para atualização de produto
export const updateProductSchema = z.object({
    name: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres")
        .max(255, "Nome deve ter no máximo 255 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ0-9\s&.,()-]+$/, "Nome contém caracteres inválidos")
        .optional(),

    description: z.string()
        .min(10, "Descrição deve ter pelo menos 10 caracteres")
        .max(1000, "Descrição deve ter no máximo 1000 caracteres")
        .optional()
        .nullable(),

    price: priceValidation.optional(),

    code: z.string()
        .regex(productCodeRegex, "Código deve conter apenas letras maiúsculas, números, hífen e underscore (3-20 caracteres)")
        .transform(str => str.toUpperCase())
        .optional(),

    barcode: z.string()
        .regex(/^\d{8,14}$/, "Código de barras deve conter apenas números (8-14 dígitos)")
        .optional()
        .nullable(),

    categoryId: z.number()
        .min(1, "Categoria é obrigatória")
        .optional(),

    supplierId: z.number()
        .min(1, "ID do fornecedor deve ser maior que 0")
        .optional()
        .nullable(),

    isActive: z.boolean().optional()
})

// Schema para filtros de busca
export const productFiltersSchema = z.object({
    search: z.string()
        .max(100, "Busca deve ter no máximo 100 caracteres")
        .optional(),

    categoryId: z.coerce.number()
        .min(1, "ID da categoria deve ser maior que 0")
        .optional(),

    supplierId: z.coerce.number()
        .min(1, "ID do fornecedor deve ser maior que 0")
        .optional(),

    isActive: z.coerce.boolean().optional(),

    hasStock: z.coerce.boolean().optional(), // Se true, mostra apenas produtos com estoque

    lowStock: z.coerce.boolean().optional(), // Se true, mostra apenas produtos com estoque baixo

    noStock: z.coerce.boolean().optional(), // Se true, mostra apenas produtos sem estoque

    minPrice: z.coerce.number()
        .min(0, "Preço mínimo não pode ser negativo")
        .optional(),

    maxPrice: z.coerce.number()
        .min(0, "Preço máximo não pode ser negativo")
        .optional(),

    hasBarcode: z.coerce.boolean().optional(),

    createdAfter: z.coerce.date().optional(),

    createdBefore: z.coerce.date().optional(),

    page: z.coerce.number()
        .min(1, "Página deve ser maior que 0")
        .default(1),

    limit: z.coerce.number()
        .min(1, "Limite deve ser maior que 0")
        .max(100, "Limite máximo é 100")
        .default(20),

    sortBy: z.enum(['name', 'code', 'price', 'categoryName', 'supplierName', 'createdAt', 'updatedAt', 'stock'])
        .default('name'),

    sortOrder: z.enum(['asc', 'desc'])
        .default('asc')
}).refine((data) => {
    // Se ambos os preços estão definidos, min deve ser menor que max
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice
    }
    return true
}, {
    message: "Preço mínimo deve ser menor ou igual ao preço máximo",
    path: ["maxPrice"]
})

// Schema para parâmetros de ID
export const productIdSchema = z.object({
    id: z.coerce.number()
        .min(1, "ID deve ser um número positivo")
})

// Schema para busca rápida
export const productSearchSchema = z.object({
    q: z.string()
        .min(2, "Query deve ter pelo menos 2 caracteres")
        .max(100, "Query deve ter no máximo 100 caracteres"),

    categoryId: z.coerce.number()
        .min(1, "ID da categoria deve ser maior que 0")
        .optional(),

    limit: z.coerce.number()
        .min(1, "Limite deve ser maior que 0")
        .max(50, "Limite máximo é 50")
        .default(10),

    includeInactive: z.coerce.boolean().default(false),

    withStock: z.coerce.boolean().default(false) // Se true, inclui informações de estoque
})

// Schema para verificação de disponibilidade de código
export const checkCodeSchema = z.object({
    code: z.string()
        .regex(productCodeRegex, "Código inválido"),
    
    excludeId: z.coerce.number()
        .min(1, "ID deve ser maior que 0")
        .optional()
})

// Tipos derivados dos schemas
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
export type CheckCodeInput = z.infer<typeof checkCodeSchema>

// Schema para resposta do produto
export const productResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    code: z.string(),
    barcode: z.string().nullable(),
    categoryId: z.number(),
    supplierId: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    category: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable()
    }),
    supplier: z.object({
        id: z.number(),
        name: z.string(),
        contactPerson: z.string().nullable()
    }).nullable(),
    inventory: z.object({
        quantity: z.number(),
        minStock: z.number(),
        maxStock: z.number().nullable(),
        location: z.string().nullable(),
        isLowStock: z.boolean()
    }).optional()
})

export type ProductResponse = z.infer<typeof productResponseSchema>

// Schema para produto com estatísticas de vendas
export const productWithStatsSchema = productResponseSchema.extend({
    stats: z.object({
        totalSales: z.number(),
        totalRevenue: z.number(),
        totalQuantitySold: z.number(),
        averageSalePrice: z.number(),
        lastSaleDate: z.date().nullable(),
        isTopSelling: z.boolean()
    })
})

export type ProductWithStats = z.infer<typeof productWithStatsSchema>

// Schema para lista de produtos com paginação
export const productsListResponseSchema = z.object({
    data: z.array(productResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        pages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean()
    }),
    filters: productFiltersSchema,
    summary: z.object({
        totalProducts: z.number(),
        activeProducts: z.number(),
        inactiveProducts: z.number(),
        lowStockProducts: z.number(),
        outOfStockProducts: z.number(),
        totalValue: z.number()
    })
})

export type ProductsListResponse = z.infer<typeof productsListResponseSchema>

// Schema para estatísticas de produtos
export const productStatsSchema = z.object({
    totalProducts: z.number(),
    activeProducts: z.number(),
    inactiveProducts: z.number(),
    averagePrice: z.number(),
    totalInventoryValue: z.number(),
    topSellingProducts: z.array(z.object({
        id: z.number(),
        name: z.string(),
        code: z.string(),
        totalSales: z.number(),
        revenue: z.number()
    })),
    lowStockProducts: z.array(z.object({
        id: z.number(),
        name: z.string(),
        code: z.string(),
        currentStock: z.number(),
        minStock: z.number()
    })),
    productsByCategory: z.record(z.string(), z.number()),
    productsBySupplier: z.record(z.string(), z.number()),
    recentProducts: z.array(productResponseSchema)
})

export type ProductStatsResponse = z.infer<typeof productStatsSchema>

// Schema para importação em lote
export const bulkImportSchema = z.object({
    products: z.array(createProductSchema.omit({ 
        initialStock: true,
        minStock: true,
        maxStock: true,
        location: true 
    })).min(1, "Deve haver pelo menos um produto").max(100, "Máximo 100 produtos por importação")
})

export type BulkImportInput = z.infer<typeof bulkImportSchema>

// Mensagens de erro padronizadas
export const PRODUCT_ERROR_MESSAGES = {
    NOT_FOUND: "Produto não encontrado",
    CODE_IN_USE: "Este código já está sendo usado por outro produto",
    BARCODE_IN_USE: "Este código de barras já está sendo usado por outro produto",
    CATEGORY_NOT_FOUND: "Categoria não encontrada",
    CATEGORY_INACTIVE: "Categoria está inativa",
    SUPPLIER_NOT_FOUND: "Fornecedor não encontrado",
    SUPPLIER_INACTIVE: "Fornecedor está inativo",
    PRODUCT_IN_USE: "Produto não pode ser excluído pois possui movimentações de estoque ou vendas",
    INVALID_PRICE: "Preço deve ser maior que zero",
    INVALID_CODE: "Código do produto inválido",
    INVALID_BARCODE: "Código de barras inválido",
    INVENTORY_EXISTS: "Produto já possui registro de estoque",
    OPERATION_NOT_ALLOWED: "Operação não permitida para este produto"
} as const

// Constantes para validação
export const MIN_PRODUCT_PRICE = 0.01
export const MAX_PRODUCT_PRICE = 999999.99
export const MIN_CODE_LENGTH = 3
export const MAX_CODE_LENGTH = 20
export const MIN_BARCODE_LENGTH = 8
export const MAX_BARCODE_LENGTH = 14

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'name'
export const DEFAULT_ORDER = 'asc'

// Helpers para validação
export const validateProductCode = (code: string): boolean => {
    return productCodeRegex.test(code.toUpperCase())
}

export const validateBarcode = (barcode: string): boolean => {
    return /^\d{8,14}$/.test(barcode)
}

export const formatProductCode = (code: string): string => {
    return code.trim().toUpperCase()
}

export const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Desconto deve estar entre 0 e 100%")
    }
    return price * (1 - discountPercent / 100)
}

// Validação de relacionamentos
export const validateCategoryExists = async (categoryId: number) => {
    // Esta função será implementada no service para verificar se categoria existe
    return true
}

export const validateSupplierExists = async (supplierId: number) => {
    // Esta função será implementada no service para verificar se fornecedor existe
    return true
}

// Tipos para select options
export type ProductSelectOption = {
    value: number
    label: string
    code: string
    price: number
    hasStock: boolean
    stockQuantity?: number
}

export type CategorySelectOption = {
    value: number
    label: string
    isActive: boolean
}

export type SupplierSelectOption = {
    value: number
    label: string
    isActive: boolean
}