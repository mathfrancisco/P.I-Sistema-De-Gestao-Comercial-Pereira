import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '../services/api/auth.service'
import type { UserInfo } from '../types/dto/auth.dto'

interface AuthState {
    user: UserInfo | null
    isAuthenticated: boolean
    loading: boolean

    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
    logout: () => void
    setUser: (user: UserInfo) => void
    clearAuth: () => void
    checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: false,

            login: async (email, password, rememberMe = false) => {
                set({ loading: true })
                try {
                    // Com cookies, o backend salva os tokens automaticamente
                    const response = await authService.login({ email, password, rememberMe })

                    // Salvamos APENAS os dados do usuário, não os tokens
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        loading: false,
                    })
                } catch (error) {
                    set({ loading: false })
                    throw error
                }
            },

            logout: async () => {
                try {
                    // Chama logout no backend para limpar cookies
                    await authService.logout()
                } catch (error) {
                    console.error('Erro ao fazer logout:', error)
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                    })
                }
            },

            setUser: (user) => {
                set({ user, isAuthenticated: true })
            },

            clearAuth: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                })
            },

            // Verifica se o usuário ainda está autenticado (útil ao recarregar página)
            checkAuth: async () => {
                try {
                    // Faz uma requisição para verificar se os cookies são válidos
                    const response = await authService.checkAuth()

                    if (response.user) {
                        set({
                            user: response.user,
                            isAuthenticated: true,
                        })
                        return true
                    }

                    set({
                        user: null,
                        isAuthenticated: false,
                    })
                    return false
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                    })
                    return false
                }
            },
        }),
        {
            name: 'auth-storage',
            // COM COOKIES: Salvamos APENAS o usuário, não os tokens
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)