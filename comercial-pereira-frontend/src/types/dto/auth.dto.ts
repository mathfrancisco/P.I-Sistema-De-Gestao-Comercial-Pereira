import { UserRole } from '../enums'

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    user: UserInfo
}

export interface UserInfo {
    id: number
    name: string
    email: string
    role: UserRole
}