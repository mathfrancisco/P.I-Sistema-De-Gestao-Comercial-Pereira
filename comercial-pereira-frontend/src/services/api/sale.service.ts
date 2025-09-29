import api from './axios.config'
import { ENDPOINTS } from '../../config/api.config'
import type { PageResponse } from '../../types/dto/common.dto'
import type {
    SaleFilters,
    SaleResponse,
    CreateSaleRequest,
    UpdateSaleRequest,
    AddSaleItemRequest,
    UpdateSaleItemRequest
} from '../../types/dto/sale.dto'

class SaleService {
    async create(data: CreateSaleRequest): Promise<SaleResponse> {
        const response = await api.post<SaleResponse>(ENDPOINTS.sales.base, data)
        return response.data
    }

    async findById(id: number): Promise<SaleResponse> {
        const response = await api.get<SaleResponse>(ENDPOINTS.sales.byId(id))
        return response.data
    }

    async findAll(filters?: SaleFilters): Promise<PageResponse<SaleResponse>> {
        const params = new URLSearchParams()

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    // Tratamento especial para arrays e objetos
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, v.toString()))
                    } else if (typeof value === 'object') {
                        params.append(key, JSON.stringify(value))
                    } else {
                        params.append(key, value.toString())
                    }
                }
            })
        }

        const response = await api.get<PageResponse<SaleResponse>>(
            `${ENDPOINTS.sales.base}?${params.toString()}`
        )
        return response.data
    }

    async update(id: number, data: UpdateSaleRequest): Promise<SaleResponse> {
        const response = await api.put<SaleResponse>(ENDPOINTS.sales.byId(id), data)
        return response.data
    }

    async cancel(id: number): Promise<SaleResponse> {
        const response = await api.patch<SaleResponse>(ENDPOINTS.sales.cancel(id))
        return response.data
    }

    async addItem(saleId: number, item: AddSaleItemRequest): Promise<SaleResponse> {
        const response = await api.post<SaleResponse>(
            ENDPOINTS.sales.items(saleId),
            item
        )
        return response.data
    }

    async updateItem(
        saleId: number,
        itemId: number,
        data: UpdateSaleItemRequest
    ): Promise<SaleResponse> {
        const response = await api.put<SaleResponse>(
            ENDPOINTS.sales.itemById(saleId, itemId),
            data
        )
        return response.data
    }

    async removeItem(saleId: number, itemId: number): Promise<SaleResponse> {
        const response = await api.delete<SaleResponse>(
            ENDPOINTS.sales.itemById(saleId, itemId)
        )
        return response.data
    }

    // Métodos adicionais baseados no controller
    async search(
        customerId?: number,
        userId?: number,
        status?: string,
        page = 0,
        size = 10,
        sortBy = 'saleDate',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<PageResponse<SaleResponse>> {
        const params = new URLSearchParams()

        if (customerId !== undefined) params.append('customerId', customerId.toString())
        if (userId !== undefined) params.append('userId', userId.toString())
        if (status) params.append('status', status)
        params.append('page', page.toString())
        params.append('size', size.toString())
        params.append('sort', `${sortBy},${sortOrder}`)

        const response = await api.get<PageResponse<SaleResponse>>(
            `${ENDPOINTS.sales.base}?${params.toString()}`
        )
        return response.data
    }

    async getSalesByCustomer(customerId: number, page = 0, size = 10): Promise<PageResponse<SaleResponse>> {
        return this.search(customerId, undefined, undefined, page, size)
    }

    async getSalesByStatus(status: string, page = 0, size = 10): Promise<PageResponse<SaleResponse>> {
        return this.search(undefined, undefined, status, page, size)
    }

    async complete(id: number): Promise<SaleResponse> {
        const response = await api.patch<SaleResponse>(
            ENDPOINTS.sales.complete(id)
        )
        return response.data
    }
}

export default new SaleService()
