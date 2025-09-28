import { ENDPOINTS } from '../../config/api.config'
import type { PageResponse, Statistics } from '../../types/dto/common.dto'
import type { CreateUserRequest, UserResponse, UserFilters, UpdateUserRequest, ResetPasswordRequest } from '../../types/dto/user.dto'
import type { UserRole } from '../../types/enums'
import api from './axios.config'

class UserService {
  async create(data: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>(ENDPOINTS.users.base, data)
    return response.data
  }

  async findMany(filters?: UserFilters): Promise<PageResponse<UserResponse>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get<PageResponse<UserResponse>>(
      `${ENDPOINTS.users.base}?${params.toString()}`
    )
    return response.data
  }

  async findById(id: number): Promise<UserResponse> {
    const response = await api.get<UserResponse>(ENDPOINTS.users.byId(id))
    return response.data
  }

  async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put<UserResponse>(ENDPOINTS.users.byId(id), data)
    return response.data
  }

  async resetPassword(id: number, data: ResetPasswordRequest): Promise<void> {
    await api.put(ENDPOINTS.users.password(id), data)
  }

  async delete(id: number, reason?: string): Promise<void> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    await api.delete(`${ENDPOINTS.users.byId(id)}${params}`)
  }

  async search(query: string, limit = 10): Promise<UserResponse[]> {
    const response = await api.get<UserResponse[]>(ENDPOINTS.users.search, {
      params: { query, limit },
    })
    return response.data
  }

  async getActiveUsers(): Promise<UserResponse[]> {
    const response = await api.get<UserResponse[]>(ENDPOINTS.users.active)
    return response.data
  }

  async getUsersByRole(role: UserRole): Promise<UserResponse[]> {
    const response = await api.get<UserResponse[]>(ENDPOINTS.users.byRole(role))
    return response.data
  }

  async getStatistics(): Promise<Statistics> {
    const response = await api.get<Statistics>(ENDPOINTS.users.statistics)
    return response.data
  }
}

export default new UserService()