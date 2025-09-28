import api from './axios.config'
import { ENDPOINTS } from '../../config/api.config'
import type { PageResponse } from '../../types/dto/common.dto'
import type { ProductFilters, ProductResponse, CreateProductRequest, UpdateProductRequest } from '../../types/dto/product.dto'

class ProductService {
  async create(data: CreateProductRequest): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>(ENDPOINTS.products.base, data)
    return response.data
  }

  async findByFilters(filters?: ProductFilters): Promise<PageResponse<ProductResponse>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get<PageResponse<ProductResponse>>(
      `${ENDPOINTS.products.base}?${params.toString()}`
    )
    return response.data
  }

  async findById(id: number): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(ENDPOINTS.products.byId(id))
    return response.data
  }

  async findByCode(code: string): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(ENDPOINTS.products.byCode(code))
    return response.data
  }

  async findByBarcode(barcode: string): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(
      ENDPOINTS.products.byBarcode(barcode)
    )
    return response.data
  }

  async update(id: number, data: UpdateProductRequest): Promise<ProductResponse> {
    const response = await api.put<ProductResponse>(
      ENDPOINTS.products.byId(id),
      data
    )
    return response.data
  }

  async delete(id: number): Promise<void> {
    await api.delete(ENDPOINTS.products.byId(id))
  }

  async search(
    query: string,
    categoryId?: number,
    limit = 20,
    includeInactive = false
  ): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(ENDPOINTS.products.search, {
      params: { q: query, categoryId, limit, includeInactive },
    })
    return response.data
  }

  async getActiveProducts(): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(ENDPOINTS.products.active)
    return response.data
  }

  async getProductsByCategory(categoryId: number): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(
      ENDPOINTS.products.byCategory(categoryId)
    )
    return response.data
  }

  async getProductsBySupplier(supplierId: number): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(
      ENDPOINTS.products.bySupplier(supplierId)
    )
    return response.data
  }

  async getLowStockProducts(): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(ENDPOINTS.products.lowStock)
    return response.data
  }

  async getOutOfStockProducts(): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(ENDPOINTS.products.outOfStock)
    return response.data
  }

  async checkCodeAvailability(
    code: string,
    excludeId?: number
  ): Promise<{ available: boolean }> {
    const response = await api.get<{ available: boolean }>(
      ENDPOINTS.products.checkCode,
      {
        params: { code, excludeId },
      }
    )
    return response.data
  }

  async toggleStatus(id: number): Promise<ProductResponse> {
    const response = await api.patch<ProductResponse>(
      ENDPOINTS.products.toggleStatus(id)
    )
    return response.data
  }

  async batchUpdateStatus(
    productIds: number[],
    isActive: boolean
  ): Promise<{ success: number; errors: number; total: number }> {
    const response = await api.post<{ success: number; errors: number; total: number }>(
      ENDPOINTS.products.batchUpdateStatus,
      { productIds, isActive }
    )
    return response.data
  }
}

export default new ProductService()