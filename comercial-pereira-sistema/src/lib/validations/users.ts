// lib/validations/users.ts
import { z } from 'zod'

// Enum para roles (deve ser consistente com o Prisma)
export const UserRoleEnum = z.enum(['ADMIN', 'MANAGER', 'SALESPERSON'])
export type UserRole = z.infer<typeof UserRoleEnum>

// Schema para criação de usuário
export const createUserSchema = z.object({
    name: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

    email: z.string()
        .email("Email inválido")
        .toLowerCase()
        .max(255, "Email deve ter no máximo 255 caracteres"),

    password: z.string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .max(128, "Senha deve ter no máximo 128 caracteres")
        .regex(/(?=.*[a-z])/, "Senha deve conter pelo menos uma letra minúscula")
        .regex(/(?=.*[A-Z])/, "Senha deve conter pelo menos uma letra maiúscula")
        .regex(/(?=.*\d)/, "Senha deve conter pelo menos um número")
        .regex(/(?=.*[@$!%*?&])/, "Senha deve conter pelo menos um caractere especial (@$!%*?&)"),

    role: UserRoleEnum.default('SALESPERSON')
})

// Schema para atualização de usuário (sem senha)
export const updateUserSchema = z.object({
    name: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")
        .optional(),

    email: z.string()
        .email("Email inválido")
        .toLowerCase()
        .max(255, "Email deve ter no máximo 255 caracteres")
        .optional(),

    role: UserRoleEnum.optional(),

    isActive: z.boolean().optional()
})

// Schema para redefinição de senha
export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .max(128, "Senha deve ter no máximo 128 caracteres")
        .regex(/(?=.*[a-z])/, "Senha deve conter pelo menos uma letra minúscula")
        .regex(/(?=.*[A-Z])/, "Senha deve conter pelo menos uma letra maiúscula")
        .regex(/(?=.*\d)/, "Senha deve conter pelo menos um número")
        .regex(/(?=.*[@$!%*?&])/, "Senha deve conter pelo menos um caractere especial (@$!%*?&)"),

    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"]
})

// Schema para alteração de status
export const updateStatusSchema = z.object({
    isActive: z.boolean(),
    reason: z.string()
        .min(10, "Motivo deve ter pelo menos 10 caracteres")
        .max(500, "Motivo deve ter no máximo 500 caracteres")
        .optional()
})

// Schema para filtros de busca
export const userFiltersSchema = z.object({
    search: z.string()
        .max(100, "Busca deve ter no máximo 100 caracteres")
        .optional(),

    role: UserRoleEnum.optional(),

    isActive: z.coerce.boolean().optional(),

    createdAfter: z.coerce.date().optional(),

    createdBefore: z.coerce.date().optional(),

    page: z.coerce.number()
        .min(1, "Página deve ser maior que 0")
        .default(1),

    limit: z.coerce.number()
        .min(1, "Limite deve ser maior que 0")
        .max(100, "Limite máximo é 100")
        .default(20),

    sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'updatedAt'])
        .default('createdAt'),

    sortOrder: z.enum(['asc', 'desc'])
        .default('desc')
})

// Schema para parâmetros de ID
export const userIdSchema = z.object({
    id: z.coerce.number()
        .min(1, "ID deve ser um número positivo")
})

// Tipos derivados dos schemas
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
export type UserIdInput = z.infer<typeof userIdSchema>

// Schema para resposta sanitizada do usuário (sem senha)
export const userResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: UserRoleEnum,
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type UserResponse = z.infer<typeof userResponseSchema>

// Schema para lista de usuários com paginação
export const usersListResponseSchema = z.object({
    data: z.array(userResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        pages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean()
    }),
    filters: userFiltersSchema
})

export type UsersListResponse = z.infer<typeof usersListResponseSchema>

// Validações customizadas adicionais
export const validateStrongPassword = (password: string): boolean => {
    // Verificações adicionais de segurança
    const hasConsecutiveChars = /(.)\1{2,}/.test(password) // 3+ caracteres consecutivos iguais
    const hasCommonPatterns = /^(password|123456|qwerty|admin)/i.test(password)

    return !hasConsecutiveChars && !hasCommonPatterns
}

export const validateEmail = async (email: string, excludeId?: number): Promise<boolean> => {
    // Esta função seria implementada no service para verificar unicidade
    // Aqui apenas validamos o formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Função para sanitizar dados do usuário (remover senha)
export const sanitizeUser = (user: any): UserResponse => {
    const { password, ...sanitized } = user
    return sanitized
}

// Mensagens de erro padronizadas
export const USER_ERROR_MESSAGES = {
    NOT_FOUND: "Usuário não encontrado",
    EMAIL_IN_USE: "Este email já está sendo usado por outro usuário",
    CANNOT_DELETE_SELF: "Não é possível excluir o próprio usuário",
    CANNOT_CHANGE_OWN_ROLE: "Não é possível alterar o próprio role",
    INVALID_CREDENTIALS: "Email ou senha inválidos",
    INACTIVE_USER: "Usuário está inativo",
    WEAK_PASSWORD: "Senha não atende aos critérios de segurança",
    OPERATION_NOT_ALLOWED: "Operação não permitida para este usuário"
} as const

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'createdAt'
export const DEFAULT_ORDER = 'desc'