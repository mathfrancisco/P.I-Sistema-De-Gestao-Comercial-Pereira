import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export type UserRole = "ADMIN" | "MANAGER" | "SALESPERSON"

// Definir permissões por role
export const PERMISSIONS = {
  ADMIN: [
    "manage_users",
    "manage_products", 
    "manage_categories",
    "manage_sales",
    "view_reports",
    "manage_suppliers"
  ],
  MANAGER: [
    "manage_products",
    "manage_categories", 
    "manage_sales",
    "view_reports",
    "manage_suppliers"
  ],
  SALESPERSON: [
    "view_products",
    "manage_sales",
    "view_customers",
    "manage_customers"
  ]
} as const

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export async function hasPermission(permission: string, userRole?: UserRole) {
  const user = await getCurrentUser()
  if (!user) return false
  
  const role = userRole || user.role
  return PERMISSIONS[role]?.includes(permission as any) || false
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Autenticação necessária")
  }
  return user
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Permissão insuficiente")
  }
  return user
}
