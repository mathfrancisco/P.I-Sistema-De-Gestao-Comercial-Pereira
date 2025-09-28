import api from './axios.config'
import { ENDPOINTS } from '../../config/api.config'
import type { PageResponse } from '../../types/dto/common.dto'
import type {
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilters,
  SupplierStatisticsResponse,
} from '../../types/dto/supplier.dto'

class SupplierService {
  /**
   * Cria um novo fornecedor.
   * Consome: `POST /api/suppliers`
   */
  async create(data: CreateSupplierRequest): Promise<SupplierResponse> {
    const response = await api.post<SupplierResponse>(ENDPOINTS.suppliers.base, data)
    return response.data
  }

  /**
   * Busca uma lista paginada de fornecedores com filtros.
   * Consome: `GET /api/suppliers`
   */
  async findByFilters(filters?: SupplierFilters): Promise<PageResponse<SupplierResponse>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    const response = await api.get<PageResponse<SupplierResponse>>(
      `${ENDPOINTS.suppliers.base}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Busca um fornecedor pelo seu ID.
   * Consome: `GET /api/suppliers/{id}`
   */
  async findById(id: number): Promise<SupplierResponse> {
    const response = await api.get<SupplierResponse>(ENDPOINTS.suppliers.byId(id))
    return response.data
  }

  /**
   * Busca um fornecedor pelo seu CNPJ.
   * Consome: `GET /api/suppliers/cnpj/{cnpj}`
   */
  async findByCnpj(cnpj: string): Promise<SupplierResponse> {
    const response = await api.get<SupplierResponse>(ENDPOINTS.suppliers.byCnpj(cnpj))
    return response.data
  }

  /**
   * Atualiza um fornecedor existente.
   * Consome: `PUT /api/suppliers/{id}`
   */
  async update(id: number, data: UpdateSupplierRequest): Promise<SupplierResponse> {
    const response = await api.put<SupplierResponse>(ENDPOINTS.suppliers.byId(id), data)
    return response.data
  }

  /**
   * Deleta (desativa) um fornecedor.
   * Consome: `DELETE /api/suppliers/{id}`
   */
  async delete(id: number): Promise<void> {
    await api.delete(ENDPOINTS.suppliers.byId(id))
  }

  /**
   * Busca fornecedores ativos.
   * Consome: `GET /api/suppliers/active`
   */
  async getActiveSuppliers(): Promise<SupplierResponse[]> {
    const response = await api.get<SupplierResponse[]>(ENDPOINTS.suppliers.active)
    return response.data
  }

  /**
   * Obtém as estatísticas do módulo de fornecedores.
   * Consome: `GET /api/suppliers/statistics`
   */
  async getStatistics(): Promise<SupplierStatisticsResponse> {
    const response = await api.get<SupplierStatisticsResponse>(ENDPOINTS.suppliers.statistics)
    return response.data
  }

  /**
   * Alterna o status (ativo/inativo) de um fornecedor.
   * Consome: `PATCH /api/suppliers/{id}/toggle-status`
   */
  async toggleStatus(id: number): Promise<SupplierResponse> {
    const response = await api.patch<SupplierResponse>(ENDPOINTS.suppliers.toggleStatus(id))
    return response.data
  }

  /**
   * Valida se um CNPJ está disponível para uso.
   * Consome: `GET /api/suppliers/validation/cnpj`
   */
  async validateCnpj(cnpj: string, excludeId?: number): Promise<{ available: boolean }> {
    const response = await api.get<{ available: boolean }>(ENDPOINTS.suppliers.validateCnpj, {
      params: { cnpj, excludeId },
    })
    return response.data
  }

  /**
   * Obtém a lista de estados (UFs) brasileiros.
   * Consome: `GET /api/suppliers/states`
   */
  async getAvailableStates(): Promise<string[]> {
    const response = await api.get<string[]>(ENDPOINTS.suppliers.states)
    return response.data
  }
}

// Exporta uma instância singleton do serviço
export default new SupplierService()