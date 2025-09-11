import { z } from "zod"

// Schema para criar produto
export const createProductSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  
  description: z.string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .nullable(),
  
  price: z.number()
    .positive("Preço deve ser positivo")
    .min(0.01, "Preço mínimo é R$ 0,01")
    .max(999999.99, "Preço máximo é R$ 999.999,99"),
  
  code: z.string()
    .min(1, "Código é obrigatório")
    .max(50, "Código deve ter no máximo 50 caracteres")
    .regex(/^[A-Z0-9_-]+$/, "Código deve conter apenas letras maiúsculas, números, _ ou -"),
  
  barcode: z.string()
    .max(50, "Código de barras deve ter no máximo 50 caracteres")
    .optional()
    .nullable(),
  
  categoryId: z.number()
    .int("ID da categoria deve ser um número inteiro")
    .positive("ID da categoria deve ser positivo"),
  
  supplierId: z.number()
    .int("ID do fornecedor deve ser um número inteiro")
    .positive("ID do fornecedor deve ser positivo")
    .optional()
    .nullable(),
  
  // Dados iniciais de estoque
  initialQuantity: z.number()
    .int("Quantidade inicial deve ser um número inteiro")
    .min(0, "Quantidade inicial não pode ser negativa")
    .default(0),
  
  minStock: z.number()
    .int("Estoque mínimo deve ser um número inteiro")
    .min(0, "Estoque mínimo não pode ser negativo")
    .default(10),
  
  maxStock: z.number()
    .int("Estoque máximo deve ser um número inteiro")
    .min(0, "Estoque máximo não pode ser negativo")
    .optional()
    .nullable(),
  
  location: z.string()
    .max(100, "Localização deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
})

// Schema para atualizar produto
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.number().int().positive(),
  // Não permitir alterar dados de estoque diretamente
  initialQuantity: z.never().optional(),
  minStock: z.number()
    .int("Estoque mínimo deve ser um número inteiro")
    .min(0, "Estoque mínimo não pode ser negativo")
    .optional(),
  maxStock: z.number()
    .int("Estoque máximo deve ser um número inteiro")
    .min(0, "Estoque máximo não pode ser negativo")
    .optional()
    .nullable(),
})

// Schema para busca/filtros
export const productSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'price', 'code', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export type CreateProductData = z.infer<typeof createProductSchema>
export type UpdateProductData = z.infer<typeof updateProductSchema>
export type ProductSearchParams = z.infer<typeof productSearchSchema>
