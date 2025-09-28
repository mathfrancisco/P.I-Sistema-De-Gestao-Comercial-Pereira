import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import  authService  from '../services/api/auth.service'
import type { UserInfo } from '../types/dto/auth.dto'

interface AuthState {
  user: UserInfo | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  setUser: (user: UserInfo) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      
      login: async (email, password) => {
        set({ loading: true })
        try {
          const response = await authService.login({ email, password })
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },
      
      logout: () => {
        authService.logout()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
      
      setTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })
      },
      
      setUser: (user) => {
        set({ user })
      },
      
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)