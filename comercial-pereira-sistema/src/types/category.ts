// types/category.ts
import { Category } from '@prisma/client'

// Tipos básicos baseados no Prisma
export type CategoryModel = Category

export interface CategoryBase {
  id: number
  name: string
  description?: string | null
  cnae?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta da API
export interface CategoryResponse extends CategoryBase {
  _count?: {
    products: number
  }
}

// Tipo para criação de categoria
export interface CreateCategoryRequest {
  name: string
  description?: string | null
  cnae?: string | null
  isActive?: boolean
}

// Tipo para atualização de categoria
export interface UpdateCategoryRequest {
  name?: string
  description?: string | null
  cnae?: string | null
  isActive?: boolean
}

// Filtros para busca
export interface CategoryFilters {
  search?: string
  isActive?: boolean
  hasCnae?: boolean
  sortBy?: 'name' | 'createdAt' | 'productCount'
  sortOrder?: 'asc' | 'desc'
  includeProductCount?: boolean
}

// Response de lista
export interface CategoriesListResponse {
  data: CategoryResponse[]
  total: number
  filters: CategoryFilters
}

// Categoria com produtos
export interface CategoryWithProducts extends CategoryResponse {
  products: {
    id: number
    name: string
    code: string
    price: number
    isActive: boolean
  }[]
}

// Filtros para produtos por categoria
export interface CategoryProductFilters {
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'code' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Estatísticas de categoria
export interface CategoryStats {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  categoriesWithProducts: number
  categoriesWithCnae: number
  productsByCategory: Record<string, number>
  topCategories: {
    id: number
    name: string
    productCount: number
    totalRevenue: number
  }[]
}

// Performance de vendas por categoria
export interface CategorySalesMetric {
  categoryId: number
  categoryName: string
  cnae?: string
  salesCount: number
  totalRevenue: number
  totalQuantitySold: number
  averageOrderValue: number
  marketShare: number
  growth: number
  topProducts: {
    id: number
    name: string
    code: string
    totalSales: number
    revenue: number
  }[]
}

// Select option para dropdowns
export interface CategorySelectOption {
  value: number
  label: string
  cnae?: string
  isActive: boolean
}

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

export type ValidCNAE = typeof VALID_CNAES[number]

// Mapeamento de categorias por CNAE
export const CATEGORY_CNAE_MAPPING = {
  "46.49-4-99": "Equipamentos Domésticos",
  "46.86-9-02": "Embalagens",
  "47.72-5-00": "Cosméticos e Higiene",
  "46.41-9-02": "Cama, Mesa e Banho",
  "46.47-8-01": "Papelaria",
  "46.72-9-00": "Ferragens",
  "46.73-7-00": "Material Elétrico",
  "46.41-9-03": "Armarinho"
} as const

// Função utilitária para validar CNAE
export function isValidCnae(cnae: string): cnae is ValidCNAE {
  return VALID_CNAES.includes(cnae as ValidCNAE)
}

// Função para obter nome da categoria pelo CNAE
export function getCategoryNameByCnae(cnae: ValidCNAE): string {
  return CATEGORY_CNAE_MAPPING[cnae]
}

// Constantes para validação
export const CATEGORY_CONSTRAINTS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CNAE_REGEX: /^\d{2}\.\d{2}-\d-\d{2}$/
} as const