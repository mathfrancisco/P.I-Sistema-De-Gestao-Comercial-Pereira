import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { toast } from 'react-hot-toast'
import { UserRole } from '../types/enums'

export const useAuth = () => {
    const navigate = useNavigate()
    const {
        user,
        isAuthenticated,
        loading,
        login: storeLogin,
        logout: storeLogout,
        checkAuth,
    } = useAuthStore()

    /**
     * Realiza login passando o parâmetro rememberMe
     */
    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        try {
            await storeLogin(email, password, rememberMe)
            toast.success('Login realizado com sucesso!')
            navigate('/')
        } catch (error: any) {
            console.error('Erro no login:', error)

            // Mensagem de erro mais específica
            const errorMessage = error?.response?.data?.message || 'Email ou senha inválidos'
            toast.error(errorMessage)

            throw error // Re-lança para o componente tratar se necessário
        }
    }

    /**
     * Realiza logout limpando cookies no backend e state no frontend
     */
    const logout = async () => {
        try {
            await storeLogout()
            toast.success('Logout realizado com sucesso')
            navigate('/login')
        } catch (error) {
            console.error('Erro no logout:', error)
            // Mesmo com erro, limpa o state local e redireciona
            navigate('/login')
        }
    }

    /**
     * Verifica se usuário tem alguma das roles especificadas
     */
    const hasRole = (roles: UserRole[]): boolean => {
        if (!user) return false
        return roles.includes(user.role)
    }

    /**
     * Verifica se usuário pode acessar recurso baseado nas roles requeridas
     * ADMIN sempre tem acesso a tudo
     */
    const canAccess = (requiredRoles: UserRole[]): boolean => {
        if (!isAuthenticated || !user) return false
        if (user.role === UserRole.ADMIN) return true
        return requiredRoles.includes(user.role)
    }

    /**
     * Verifica se é ADMIN
     */
    const isAdmin = (): boolean => {
        return user?.role === UserRole.ADMIN
    }

    /**
     * Verifica se é MANAGER
     */
    const isManager = (): boolean => {
        return user?.role === UserRole.MANAGER
    }

    /**
     * Verifica se é SALESPERSON
     */
    const isSalesperson = (): boolean => {
        return user?.role === UserRole.SALESPERSON
    }

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
        hasRole,
        canAccess,
        isAdmin,
        isManager,
        isSalesperson,
    }
}