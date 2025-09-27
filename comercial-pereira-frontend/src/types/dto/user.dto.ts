import { UserRole } from '../enums'

export interface UserResponse {
    id: number
    name: string
    email: string
    role: UserRole
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateUserRequest {
    name: string
    email: string
    password: string
    role?: UserRole
}

export interface UpdateUserRequest {
    name?: string
    email?: string
    role?: UserRole
    isActive?: boolean
}

export interface UserFilters {
    search?: string
    role?: UserRole
    isActive?: boolean
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface ResetPasswordRequest {
    password: string
}