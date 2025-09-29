import api from './axios.config' 
import { ENDPOINTS } from '../../config/api.config' 
import type { PageResponse } from '../../types/dto/common.dto'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
  CategorySelectOption,
  CategoryStatisticsResponse,
} from '../../types/dto/category.dto'

class CategoryService {
  /**
   * Cria uma nova categoria.
   * Consome: `POST /api/categories`
   */
  async create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const response = await api.post<CategoryResponse>(ENDPOINTS.categories.base, data)
    return response.data
  }

  /**
   * Busca uma lista paginada de categorias com filtros.
   * Consome: `GET /api/categories`
   */
  async findMany(filters?: CategoryFilters): Promise<PageResponse<CategoryResponse>> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    const response = await api.get<PageResponse<CategoryResponse>>(
      `${ENDPOINTS.categories.base}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Busca uma categoria pelo seu ID.
   * Consome: `GET /api/categories/{id}`
   */
  async findById(id: number): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>(ENDPOINTS.categories.byId(id))
    return response.data
  }

  /**
   * Busca uma categoria pelo nome.
   * Consome: `GET /api/categories/by-name/{name}`
   */
  async findByName(name: string): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>(ENDPOINTS.categories.byName(name))
    return response.data
  }

  /**
   * Busca uma categoria pelo CNAE.
   * Consome: `GET /api/categories/by-cnae/{cnae}`
   */
  async findByCnae(cnae: string): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>(ENDPOINTS.categories.byCnae(cnae))
    return response.data
  }

  /**
   * Atualiza uma categoria existente.
   * Consome: `PUT /api/categories/{id}`
   */
  async update(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const response = await api.put<CategoryResponse>(ENDPOINTS.categories.byId(id), data)
    return response.data
  }

  /**
   * Deleta uma categoria (requer motivo opcional).
   * Consome: `DELETE /api/categories/{id}`
   */
  async delete(id: number, reason?: string): Promise<void> {
    await api.delete(ENDPOINTS.categories.byId(id), {
      params: { reason },
    })
  }

  /**
   * Busca categorias ativas (geralmente para listagem rápida).
   * Consome: `GET /api/categories/active`
   */
  async getActiveCategories(): Promise<CategoryResponse[]> {
    const response = await api.get<CategoryResponse[]>(ENDPOINTS.categories.active)
    return response.data
  }

  /**
   * Busca categorias formatadas para uso em componentes de select/dropdown.
   * Consome: `GET /api/categories/for-select`
   */
  async getCategoriesForSelect(): Promise<CategorySelectOption[]> {
    const response = await api.get<CategorySelectOption[]>(ENDPOINTS.categories.forSelect)
    return response.data
  }
  
  /**
   * Obtém as estatísticas do módulo de categorias.
   * Consome: `GET /api/categories/statistics`
   */
  async getStatistics(): Promise<CategoryStatisticsResponse> {
    const response = await api.get<CategoryStatisticsResponse>(ENDPOINTS.categories.statistics)
    return response.data
  }

    async search(query: string, limit = 10): Promise<CategoryResponse[]> {
        const response = await api.get<CategoryResponse[]>(ENDPOINTS.categories.search, {
            params: { query, limit }
        })
        return response.data
    }

    async getCategoriesWithCnae(): Promise<CategoryResponse[]> {
        const response = await api.get<CategoryResponse[]>(ENDPOINTS.categories.withCnae)
        return response.data
    }
}


// Exporta uma instância singleton do serviço
export default new CategoryService()