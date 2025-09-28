import api from './axios.config'
import { ENDPOINTS } from '../../config/api.config'
import type { PageResponse } from '../../types/dto/common.dto'
import type { InventoryFilters, InventoryResponse, CreateInventoryRequest, UpdateInventoryRequest, StockAdjustmentRequest, MovementFilters, MovementResponse, InventoryStatsResponse, StockCheckResponse } from '../../types/dto/inventory.dto'

class InventoryService {
  async createForProduct(
    productId: number,
    data: CreateInventoryRequest
  ): Promise<InventoryResponse> {
    const response = await api.post<InventoryResponse>(ENDPOINTS.inventory.base, {
      ...data,
      productId,
    })
    return response.data
  }

  async findMany(filters?: InventoryFilters): Promise<PageResponse<InventoryResponse>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get<PageResponse<InventoryResponse>>(
      `${ENDPOINTS.inventory.base}?${params.toString()}`
    )
    return response.data
  }

  async findById(id: number): Promise<InventoryResponse> {
    const response = await api.get<InventoryResponse>(ENDPOINTS.inventory.byId(id))
    return response.data
  }

  async findByProductId(productId: number): Promise<InventoryResponse> {
    const response = await api.get<InventoryResponse>(
      ENDPOINTS.inventory.byProduct(productId)
    )
    return response.data
  }

  async update(id: number, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    const response = await api.put<InventoryResponse>(
      ENDPOINTS.inventory.byId(id),
      data
    )
    return response.data
  }

  async adjustStock(data: StockAdjustmentRequest): Promise<InventoryResponse> {
    const response = await api.post<InventoryResponse>(
      ENDPOINTS.inventory.adjust,
      data
    )
    return response.data
  }

  async addStock(
    productId: number,
    quantity: number,
    reason: string
  ): Promise<InventoryResponse> {
    const response = await api.post<InventoryResponse>(ENDPOINTS.inventory.add, null, {
      params: { productId, quantity, reason },
    })
    return response.data
  }

  async removeStock(
    productId: number,
    quantity: number,
    reason: string,
    saleId?: number
  ): Promise<InventoryResponse> {
    const params: { productId: number; quantity: number; reason: string; saleId?: number } = { productId, quantity, reason }
    if (saleId) params.saleId = saleId
    
    const response = await api.post<InventoryResponse>(
      ENDPOINTS.inventory.remove,
      null,
      { params }
    )
    return response.data
  }

  async getMovements(filters?: MovementFilters): Promise<PageResponse<MovementResponse>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get<PageResponse<MovementResponse>>(
      `${ENDPOINTS.inventory.movements}?${params.toString()}`
    )
    return response.data
  }

  async getProductMovements(
    productId: number,
    limit = 20
  ): Promise<MovementResponse[]> {
    const response = await api.get<MovementResponse[]>(
      ENDPOINTS.inventory.productMovements(productId),
      { params: { limit } }
    )
    return response.data
  }

  async getStatistics(): Promise<InventoryStatsResponse> {
    const response = await api.get<InventoryStatsResponse>(
      ENDPOINTS.inventory.statistics
    )
    return response.data
  }

  async getLowStockAlert(): Promise<InventoryResponse[]> {
    const response = await api.get<InventoryResponse[]>(ENDPOINTS.inventory.lowStock)
    return response.data
  }

  async getOutOfStockProducts(): Promise<InventoryResponse[]> {
    const response = await api.get<InventoryResponse[]>(
      ENDPOINTS.inventory.outOfStock
    )
    return response.data
  }

  async checkStock(productId: number): Promise<StockCheckResponse> {
    const response = await api.get<StockCheckResponse>(
      ENDPOINTS.inventory.check(productId)
    )
    return response.data
  }

  async hasInventory(productId: number): Promise<boolean> {
    const response = await api.get<boolean>(ENDPOINTS.inventory.exists(productId))
    return response.data
  }

  async reserveStock(productId: number, quantity: number): Promise<boolean> {
    const response = await api.post<boolean>(ENDPOINTS.inventory.reserve, null, {
      params: { productId, quantity },
    })
    return response.data
  }
}

export default new InventoryService()