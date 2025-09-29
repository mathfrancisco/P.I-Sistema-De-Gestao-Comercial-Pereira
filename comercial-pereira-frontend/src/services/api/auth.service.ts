import { ENDPOINTS } from '../../config/api.config'
import type { LoginRequest, LoginResponse, CheckAuthResponse } from '../../types/dto/auth.dto'
import api from './axios.config'

class AuthService {
    async login(credentials: LoginRequest & { rememberMe?: boolean }): Promise<LoginResponse> {
        // Com cookies, o backend define os cookies automaticamente na resposta
        const response = await api.post<LoginResponse>(ENDPOINTS.auth.login, credentials)
        return response.data
    }

    async refresh(): Promise<void> {
        // Com cookies, não precisa enviar refresh token manualmente
        // O cookie é enviado automaticamente
        await api.post(ENDPOINTS.auth.refresh)
    }

    async logout(): Promise<void> {
        try {
            // Chama endpoint de logout para limpar cookies no backend
            await api.post(ENDPOINTS.auth.logout)
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
        }
    }

    async checkAuth(): Promise<CheckAuthResponse> {
        // Verifica se o usuário ainda está autenticado
        // Os cookies são enviados automaticamente
        const response = await api.get<CheckAuthResponse>(ENDPOINTS.auth.me)
        return response.data
    }
}

export default new AuthService()