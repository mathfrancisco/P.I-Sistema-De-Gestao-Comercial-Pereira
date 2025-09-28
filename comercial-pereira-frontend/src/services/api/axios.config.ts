import axios, { AxiosError, type AxiosInstance  } from 'axios'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '../../config/api.config'
import { useAuthStore } from '../../store/auth.store'

const api: AxiosInstance = axios.create(API_CONFIG)

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Add User-ID header if required
        const userId = useAuthStore.getState().user?.id
        if (userId) {
            config.headers['User-ID'] = userId.toString()
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = useAuthStore.getState().refreshToken
                if (refreshToken) {
                    const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
                        refreshToken,
                    })

                    const { accessToken } = response.data
                    useAuthStore.getState().setTokens({
                        accessToken,
                        refreshToken,
                    })

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                useAuthStore.getState().logout()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        // Handle common errors
        if (error.response) {
            const status = error.response.status
            const data = error.response.data as unknown as { message?: string }

            switch (status) {
                case 400:
                    toast.error(data.message || 'Dados inválidos')
                    break
                case 403:
                    toast.error('Acesso negado')
                    break
                case 404:
                    toast.error('Recurso não encontrado')
                    break
                case 409:
                    toast.error(data.message || 'Conflito de dados')
                    break
                case 500:
                    toast.error('Erro no servidor. Tente novamente mais tarde')
                    break
                default:
                    toast.error(data.message || 'Erro ao processar solicitação')
            }
        } else if (error.request) {
            toast.error('Erro de conexão. Verifique sua internet')
        } else {
            toast.error('Erro ao configurar requisição')
        }

        return Promise.reject(error)
    }
)

export default api