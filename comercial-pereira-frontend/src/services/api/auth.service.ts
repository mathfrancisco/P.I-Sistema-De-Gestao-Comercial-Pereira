import { ENDPOINTS } from '../../config/api.config'
import type { LoginRequest, LoginResponse } from '../../types/dto/auth.dto'
import api from './axios.config'

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>(ENDPOINTS.auth.login, credentials)
        return response.data
    }

    async refresh(refreshToken: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>(ENDPOINTS.auth.refresh, {
            refreshToken,
        })
        return response.data
    }

    async logout(): Promise<void> {
        try {
            await api.post(ENDPOINTS.auth.logout)
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
        }
    }
}

export default new AuthService()