import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export type UserRole = "ADMIN" | "MANAGER" | "SALESPERSON"

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export class ApiAuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'ApiAuthError'
  }
}

export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new ApiAuthError("Autenticação necessária", 401)
  }
  
  return session.user as AuthenticatedUser
}

export async function requireRole(...allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()
  
  if (!allowedRoles.includes(user.role)) {
    throw new ApiAuthError(
      `Permissão insuficiente. Necessário: ${allowedRoles.join(' ou ')}. Atual: ${user.role}`,
      403
    )
  }
  
  return user
}

export async function requireAdminOrManager(): Promise<AuthenticatedUser> {
  return requireRole('ADMIN', 'MANAGER')
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole('ADMIN')
}

export function handleApiError(error: unknown) {
  console.error('❌ API Error:', error)
  
  if (error instanceof ApiAuthError) {
    return {
      error: error.message,
      statusCode: error.statusCode
    }
  }
  
  return {
    error: 'Erro interno do servidor',
    statusCode: 500
  }
}
