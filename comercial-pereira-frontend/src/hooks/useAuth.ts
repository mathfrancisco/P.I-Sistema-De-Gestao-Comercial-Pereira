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
  } = useAuthStore()
  
  const login = async (email: string, password: string) => {
    try {
      await storeLogin(email, password)
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Email ou senha inválidos')
    }
  }
  
  const logout = () => {
    storeLogout()
    navigate('/login')
    toast.success('Logout realizado com sucesso')
  }
  
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }
  
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false
    if (user.role === UserRole.ADMIN) return true
    return requiredRoles.includes(user.role)
  }
  
  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    canAccess,
  }
}