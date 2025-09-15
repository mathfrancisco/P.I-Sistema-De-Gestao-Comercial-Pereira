// types/user.ts
import { User } from '@prisma/client'

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALESPERSON = 'SALESPERSON'
}

// Tipos básicos baseados no Prisma
export type UserModel = User

export interface UserBase {
  id: number
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo sem senha para respostas da API
export interface UserResponse extends UserBase {}

// Tipo para criação de usuário
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: UserRole
}

// Tipo para atualização de usuário
export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
}

// Tipo para redefinição de senha
export interface ResetPasswordRequest {
  password: string
  confirmPassword: string
}

// Tipo para alteração de status
export interface UpdateUserStatusRequest {
  isActive: boolean
  reason?: string
}

// Filtros para busca
export interface UserFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  createdAfter?: Date
  createdBefore?: Date
  page?: number
  limit?: number
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Response de lista paginada
export interface UsersListResponse {
  data: UserResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: UserFilters
}

// Estatísticas de usuários
export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<UserRole, number>
  recentUsers: UserResponse[]
}

// Performance de vendedor
export interface UserSalesPerformance {
  userId: number
  userName: string
  userRole: UserRole
  salesCount: number
  totalRevenue: number
  averageOrderValue: number
  topCategory: string
  efficiency: number
  growth: number
  period: {
    from: Date
    to: Date
  }
}

// Select option para dropdowns
export interface UserSelectOption {
  value: number
  label: string
  role: UserRole
  isActive: boolean
}

// Tipo para autenticação
export interface AuthUser {
  id: number
  email: string
  name: string
  role: UserRole
  isActive: boolean
}

// Contexto de usuário autenticado
export interface AuthenticatedUser extends AuthUser {
  permissions: string[]
  lastLogin?: Date
}

// Histórico de atividades do usuário
export interface UserActivity {
  id: number
  userId: number
  action: string
  module: string
  resourceId?: number
  details?: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Profile do usuário para edição
export interface UserProfile {
  name: string
  email: string
  preferences?: {
    language: string
    timezone: string
    notifications: boolean
  }
}

// Constantes
export const USER_ROLES = Object.values(UserRole) as readonly UserRole[]
export type UserRoleType = typeof UserRole[keyof typeof UserRole]

export const USER_PERMISSIONS = {
  [UserRole.ADMIN]: ['*'], // Todas as permissões
  [UserRole.MANAGER]: [
    'products:read', 'products:write',
    'suppliers:read', 'suppliers:write',
    'inventory:read', 'inventory:write',
    'sales:read', 'customers:read', 'customers:write',
    'reports:read', 'dashboard:read'
  ],
  [UserRole.SALESPERSON]: [
    'products:read', 'suppliers:read',
    'inventory:read', 'sales:read', 'sales:write',
    'customers:read', 'customers:write'
  ]
} as const