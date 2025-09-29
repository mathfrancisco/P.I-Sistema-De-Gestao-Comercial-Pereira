import axios, { AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '../../config/api.config'

const api: AxiosInstance = axios.create({
    ...API_CONFIG,
    // CRÍTICO: Permite envio de cookies cross-origin
    withCredentials: true,
})

// Flag para evitar múltiplas tentativas de refresh
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// REQUEST INTERCEPTOR
// Com cookies, NÃO precisamos adicionar Authorization header
// O navegador envia os cookies automaticamente
api.interceptors.request.use(
    (config) => {
        // Os cookies são enviados automaticamente pelo navegador
        // Não precisa adicionar nada aqui!
        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Se não é erro 401 ou já tentou refresh, trata o erro
        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
            handleResponseError(error)
            return Promise.reject(error)
        }

        // Se é rota de login/refresh que falhou, redireciona
        if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh')
        ) {
            window.location.href = '/login'
            return Promise.reject(error)
        }

        // Se já está refreshing, adiciona à fila
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then(() => {
                    // Após refresh bem-sucedido, reexecuta requisição
                    return api(originalRequest)
                })
                .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            // Tenta renovar o token
            // Com cookies, o refresh token é enviado automaticamente
            await api.post('/api/auth/refresh')

            // Se deu certo, processa a fila
            processQueue(null, 'success')
            isRefreshing = false

            // Reexecuta a requisição original
            return api(originalRequest)
        } catch (refreshError) {
            // Se falhou o refresh, desloga o usuário
            processQueue(refreshError, null)
            isRefreshing = false

            toast.error('Sessão expirada. Faça login novamente.')
            window.location.href = '/login'

            return Promise.reject(refreshError)
        }
    }
)

// Função auxiliar para tratar erros de resposta
function handleResponseError(error: AxiosError) {
    if (error.response) {
        const status = error.response.status
        const data = error.response.data as { message?: string }

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
                if (data.message) {
                    toast.error(data.message)
                }
        }
    } else if (error.request) {
        toast.error('Erro de conexão. Verifique sua internet')
    } else {
        toast.error('Erro ao configurar requisição')
    }
}

export default api