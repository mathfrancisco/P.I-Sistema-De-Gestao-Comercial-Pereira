import { ENDPOINTS } from '../../config/api.config';
import type { PageResponse } from '../../types/dto/common.dto';
import type { CustomerFilters, CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest } from '../../types/dto/customer.dto';
import api from './axios.config'


class CustomerService {
  async findAll(filters?: CustomerFilters & { page?: number; size?: number }): Promise<PageResponse<CustomerResponse>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get<PageResponse<CustomerResponse>>(
      `${ENDPOINTS.customers.base}?${params.toString()}`
    )
    return response.data
  }

  async findById(id: number): Promise<CustomerResponse> {
    const response = await api.get<CustomerResponse>(ENDPOINTS.customers.byId(id))
    return response.data
  }

  async create(data: CreateCustomerRequest): Promise<CustomerResponse> {
    const response = await api.post<CustomerResponse>(ENDPOINTS.customers.base, data)
    return response.data
  }

  async update(id: number, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    const response = await api.put<CustomerResponse>(
      ENDPOINTS.customers.byId(id),
      data
    )
    return response.data
  }

  async delete(id: number): Promise<{ message: string; success: boolean }> {
    const response = await api.delete<{ message: string; success: boolean }>(
      ENDPOINTS.customers.byId(id)
    )
    return response.data
  }

    async search(query: string, limit = 10): Promise<CustomerResponse[]> {
        const response = await api.get<PageResponse<CustomerResponse>>(
            ENDPOINTS.customers.base,
            { params: { search: query, size: limit } }
        )
        return response.data.content // Retornar apenas o array de content
    }
}

export default new CustomerService()