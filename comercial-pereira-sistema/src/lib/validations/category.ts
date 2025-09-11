import { z } from "zod"

// Schema para criar categoria
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  
  description: z.string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
  
  cnae: z.string()
    .regex(/^\d{2}\.\d{2}-\d-\d{2}$/, "CNAE deve estar no formato XX.XX-X-XX")
    .optional()
    .nullable(),
  
  isActive: z.boolean().default(true)
})

// Schema para atualizar categoria
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.number().int().positive()
})

// Schema para busca/filtros de categorias
export const categorySearchSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  hasCnae: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'productCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  includeProductCount: z.coerce.boolean().default(true)
})

// Schema para busca de produtos por categoria
export const categoryProductsSchema = z.object({
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().default(true),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['name', 'price', 'code', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export type CreateCategoryData = z.infer<typeof createCategorySchema>
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>
export type CategorySearchParams = z.infer<typeof categorySearchSchema>
export type CategoryProductsParams = z.infer<typeof categoryProductsSchema>

// CNAEs válidos da Comercial Pereira
export const VALID_CNAES = [
  "46.49-4-99", // Comércio atacadista de outros equipamentos e artigos de uso pessoal e doméstico
  "46.86-9-02", // Comércio atacadista de embalagens
  "47.72-5-00", // Comércio varejista de cosméticos, produtos de perfumaria e de higiene pessoal
  "46.41-9-02", // Comércio atacadista de artigos de cama, mesa e banho
  "46.47-8-01", // Comércio atacadista de artigos de escritório e de papelaria
  "46.72-9-00", // Comércio atacadista de ferragens e ferramentas
  "46.73-7-00", // Comércio atacadista de material elétrico
  "46.41-9-03"  // Comércio atacadista de artigos de armarinho
] as const

export function isValidCnae(cnae: string): boolean {
  return VALID_CNAES.includes(cnae as any)
}
