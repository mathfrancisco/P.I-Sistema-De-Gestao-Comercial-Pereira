// lib/validations/category.ts
import { z } from 'zod'
import {
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CategoryFilters,
  type CategoryProductFilters,
  CATEGORY_CONSTRAINTS,
  VALID_CNAES,
  isValidCnae,
  getCategoryNameByCnae
} from '@/types/category'

// Schema para criação de categoria usando os types
export const createCategorySchema = z.object({
  name: z.string()
    .min(CATEGORY_CONSTRAINTS.NAME_MIN_LENGTH, "Nome é obrigatório")
    .max(CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH, `Nome deve ter no máximo ${CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`)
    .trim(),
    
  description: z.string()
    .max(CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Descrição deve ter no máximo ${CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  cnae: z.string()
    .regex(CATEGORY_CONSTRAINTS.CNAE_REGEX, "CNAE deve estar no formato XX.XX-X-XX")
    .refine((cnae) => !cnae || isValidCnae(cnae), "CNAE inválido para a Comercial Pereira")
    .optional()
    .nullable(),
    
  isActive: z.boolean().default(true)
}) satisfies z.ZodType<CreateCategoryRequest>

// Schema para atualização de categoria usando os types
export const updateCategorySchema = z.object({
  name: z.string()
    .min(CATEGORY_CONSTRAINTS.NAME_MIN_LENGTH, "Nome é obrigatório")
    .max(CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH, `Nome deve ter no máximo ${CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`)
    .trim()
    .optional(),
    
  description: z.string()
    .max(CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Descrição deve ter no máximo ${CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  cnae: z.string()
    .regex(CATEGORY_CONSTRAINTS.CNAE_REGEX, "CNAE deve estar no formato XX.XX-X-XX")
    .refine((cnae) => !cnae || isValidCnae(cnae), "CNAE inválido para a Comercial Pereira")
    .optional()
    .nullable(),
    
  isActive: z.boolean().optional()
}) satisfies z.ZodType<UpdateCategoryRequest>

// Schema para busca/filtros de categorias usando os types
export const categoryFiltersSchema = z.object({
  search: z.string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(),
    
  isActive: z.coerce.boolean().optional(),
  
  hasCnae: z.coerce.boolean().optional(),
  
  sortBy: z.enum(['name', 'createdAt', 'productCount'])
    .default('name'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('asc'),
    
  includeProductCount: z.coerce.boolean()
    .default(true)
}) satisfies z.ZodType<CategoryFilters>

// Schema para busca de produtos por categoria usando os types
export const categoryProductFiltersSchema = z.object({
  search: z.string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(),
    
  minPrice: z.coerce.number()
    .positive("Preço mínimo deve ser positivo")
    .optional(),
    
  maxPrice: z.coerce.number()
    .positive("Preço máximo deve ser positivo")
    .optional(),
    
  inStock: z.coerce.boolean().optional(),
  
  isActive: z.coerce.boolean().default(true),
  
  page: z.coerce.number()
    .int()
    .min(1, "Página deve ser maior que 0")
    .default(1),
    
  limit: z.coerce.number()
    .int()
    .min(1, "Limite deve ser maior que 0")
    .max(50, "Limite máximo é 50")
    .default(10),
    
  sortBy: z.enum(['name', 'price', 'code', 'createdAt'])
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
}) satisfies z.ZodType<CategoryProductFilters>

// Schema para parâmetros de ID
export const categoryIdSchema = z.object({
  id: z.coerce.number()
    .int()
    .min(1, "ID deve ser um número positivo")
})

// Tipos derivados dos schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryFiltersInput = z.infer<typeof categoryFiltersSchema>
export type CategoryProductFiltersInput = z.infer<typeof categoryProductFiltersSchema>
export type CategoryIdInput = z.infer<typeof categoryIdSchema>

// SCHEMAS E TIPOS DE RESPOSTA
export const categoryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  cnae: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  productCount: z.number().optional(),
  productsPreview: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    code: z.string()
  })).optional()
})

export const categoryWithProductsSchema = categoryResponseSchema.extend({
  statistics: z.object({
    totalProducts: z.number(),
    totalValue: z.number(),
    averagePrice: z.number(),
    lowStockProducts: z.number(),
    totalInventoryValue: z.number()
  }).optional(),
  recentProducts: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    code: z.string(),
    createdAt: z.date(),
    inventory: z.object({
      quantity: z.number(),
      minStock: z.number(),
      maxStock: z.number().nullable(),
      location: z.string().nullable(),
      lastUpdate: z.date()
    }).nullable()
  })).optional()
})

export const categoriesListResponseSchema = z.object({
  data: z.array(categoryResponseSchema),
  total: z.number(),
  filters: categoryFiltersSchema
})

export const categoryProductsResponseSchema = z.object({
  category: z.object({
    id: z.number(),
    name: z.string(),
    isActive: z.boolean()
  }),
  products: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    code: z.string(),
    barcode: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
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
      lastUpdate: z.date()
    }).nullable(),
    recentSales: z.array(z.object({
      quantity: z.number(),
      total: z.number(),
      date: z.date(),
      status: z.string()
    })).optional()
  })),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean()
  }),
  statistics: z.object({
    category: z.object({
      totalProducts: z.number(),
      averagePrice: z.number(),
      minPrice: z.number(),
      maxPrice: z.number()
    }),
    inventory: z.object({
      totalQuantity: z.number(),
      averageQuantity: z.number()
    })
  }),
  filters: categoryProductFiltersSchema
})

export const categoryStatsSchema = z.object({
  totalCategories: z.number(),
  activeCategories: z.number(),
  inactiveCategories: z.number(),
  categoriesWithProducts: z.number(),
  categoriesWithCnae: z.number(),
  productsByCategory: z.record(z.string(), z.number()),
  topCategories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    productCount: z.number(),
    totalRevenue: z.number()
  }))
})

// ===== TIPOS DE RESPOSTA EXPORTADOS =====
export type CategoryResponse = z.infer<typeof categoryResponseSchema>
export type CategoryWithProducts = z.infer<typeof categoryWithProductsSchema>
export type CategoriesListResponse = z.infer<typeof categoriesListResponseSchema>
export type CategoryProductsResponse = z.infer<typeof categoryProductsResponseSchema>
export type CategoryStats = z.infer<typeof categoryStatsSchema>

// Mensagens de erro padronizadas
export const CATEGORY_ERROR_MESSAGES = {
  NOT_FOUND: "Categoria não encontrada",
  ALREADY_EXISTS: "Categoria com este nome já existe",
  NAME_IN_USE: "Nome já está sendo usado por outra categoria",
  CNAE_IN_USE: "CNAE já está sendo usado por outra categoria",
  INVALID_CNAE: "CNAE inválido para a Comercial Pereira",
  REQUIRED_NAME: "Nome é obrigatório",
  HAS_ACTIVE_PRODUCTS: "Categoria possui produtos ativos e não pode ser desativada",
  HAS_PRODUCTS: "Categoria possui produtos e não pode ser excluída",
  OPERATION_NOT_ALLOWED: "Operação não permitida para esta categoria"
} as const

// Constantes para validação (re-exportadas dos types)
export { 
  CATEGORY_CONSTRAINTS,
  VALID_CNAES,
  isValidCnae,
  getCategoryNameByCnae
}

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 50
export const DEFAULT_SORT = 'name'
export const DEFAULT_ORDER = 'asc'

// Helper para validar CNAE
export const validateCnae = (cnae: string): { isValid: boolean; error?: string } => {
  if (!CATEGORY_CONSTRAINTS.CNAE_REGEX.test(cnae)) {
    return { isValid: false, error: "CNAE deve estar no formato XX.XX-X-XX" }
  }
  
  if (!isValidCnae(cnae)) {
    return { 
      isValid: false, 
      error: "CNAE inválido para a Comercial Pereira",
    }
  }
  
  return { isValid: true }
}

// Helper para validar regras de negócio de categoria
export const validateCategoryBusinessRules = (data: CreateCategoryRequest | UpdateCategoryRequest): string[] => {
  const errors: string[] = []
  
  // Validar CNAE se fornecido
  if (data.cnae) {
    const cnaeValidation = validateCnae(data.cnae)
    if (!cnaeValidation.isValid) {
      errors.push(cnaeValidation.error!)
    }
  }
  
  return errors
}

// Helper para verificar se categoria pode ser desativada
export const canDeactivateCategory = async (categoryId: number): Promise<boolean> => {
  // Esta verificação seria feita no service consultando produtos ativos
  // Por enquanto retorna true, mas o service implementará a lógica real
  return true
}

// Helper para verificar se categoria pode ser excluída
export const canDeleteCategory = async (categoryId: number): Promise<boolean> => {
  // Esta verificação seria feita no service consultando produtos
  // Por enquanto retorna true, mas o service implementará a lógica real
  return true
}

// Helper para sugerir CNAE baseado no nome da categoria
export const suggestCnaeByName = (categoryName: string): string | null => {
  const lowerName = categoryName.toLowerCase()
  
  if (lowerName.includes('cosmético') || lowerName.includes('higiene') || lowerName.includes('perfume')) {
    return "47.72-5-00"
  }
  if (lowerName.includes('embalagem')) {
    return "46.86-9-02"
  }
  if (lowerName.includes('cama') || lowerName.includes('mesa') || lowerName.includes('banho')) {
    return "46.41-9-02"
  }
  if (lowerName.includes('papelaria') || lowerName.includes('escritório')) {
    return "46.47-8-01"
  }
  if (lowerName.includes('ferramenta') || lowerName.includes('ferragen')) {
    return "46.72-9-00"
  }
  if (lowerName.includes('elétric')) {
    return "46.73-7-00"
  }
  if (lowerName.includes('armarinho')) {
    return "46.41-9-03"
  }
  
  // Default para equipamentos domésticos
  return "46.49-4-99"
}

// Helper para formatação de exibição
export const formatCategoryForDisplay = (category: CategoryResponse) => {
  return {
    ...category,
    cnaeLabel: category.cnae ? getCategoryNameByCnae(category.cnae as any) : null,
    statusLabel: category.isActive ? 'Ativa' : 'Inativa'
  }
}