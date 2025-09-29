import { UserRole } from '../enums'

export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
}

export interface LoginResponse {
    // NÃO tem mais accessToken e refreshToken (estão nos cookies)
    user: UserInfo
    expiresIn: number
}

export interface UserInfo {
    id: number
    name: string
    email: string
    role: UserRole
}

export interface CheckAuthResponse {
    user: UserInfo
    expiresIn?: number
}