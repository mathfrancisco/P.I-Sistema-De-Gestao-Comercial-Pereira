/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Representa a resposta completa de uma Categoria vinda da API.
 * Corresponde ao `CategoryResponse` do backend.
 */
export interface CategoryResponse {
  id: number
  name: string
  description: string | null
  cnae: string | null
  isActive: boolean
  createdAt: string // Datas são recebidas como string no formato ISO
  updatedAt: string
  productCount: number | null
}

/**
 * Dados necessários para criar uma nova Categoria.
 * Corresponde ao `CreateCategoryRequest` do backend.
 */
export interface CreateCategoryRequest {
  name: string
  description?: string
  cnae?: string
  isActive?: boolean
}

/**
 * Dados que podem ser enviados para atualizar uma Categoria.
 * Todos os campos são opcionais. Corresponde ao `UpdateCategoryRequest`.
 */
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

/**
 * Filtros disponíveis para a busca paginada de Categorias.
 * Corresponde ao `CategoryFilters` do backend.
 */
export interface CategoryFilters {
  search?: string
  isActive?: boolean
  hasCnae?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeProductCount?: boolean
}

/**
 * Formato simplificado para usar em selects/dropdowns.
 * Corresponde à resposta de `GET /api/categories/for-select`.
 */
export interface CategorySelectOption {
  value: number
  label: string
  cnae: string | null
  isActive: boolean
}

/**
 * Representa a resposta da API de estatísticas.
 * Corresponde à resposta de `GET /api/categories/statistics`.
 */
export interface CategoryStatisticsResponse {
  total: number
  active: number
  inactive: number
  withCnae: number
  withProducts: number
  productsByCategory: Record<string, number>
  topCategories: Array<{
    id: number
    name: string
    productCount: number
    totalRevenue: number
  }>
}