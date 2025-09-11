// lib/services/users.ts
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

import {
    CreateUserInput,
    UpdateUserInput,
    ResetPasswordInput,
    UpdateStatusInput,
    UserFiltersInput,
    UserResponse,
    UsersListResponse,
    sanitizeUser,
    USER_ERROR_MESSAGES,
    validateStrongPassword
} from '@/lib/validations/users'

export class ApiError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message)
        this.name = 'ApiError'
    }
}

export class UserService {
    // =================== CREATE ===================

    static async create(data: CreateUserInput, currentUserId: number): Promise<UserResponse> {
        try {
            // 1. Validar email único
            await this.validateUniqueEmail(data.email)

            // 2. Validar força da senha
            if (!validateStrongPassword(data.password)) {
                throw new ApiError(USER_ERROR_MESSAGES.WEAK_PASSWORD, 400)
            }

            // 3. Hash da senha
            const hashedPassword = await bcrypt.hash(data.password, 12)

            // 4. Criar usuário no banco
            const user = await prisma.user.create({
                data: {
                    ...data,
                    password: hashedPassword,
                    email: data.email.toLowerCase()
                }
            })

            // 5. Log da operação
            await this.logUserOperation(currentUserId, 'CREATE', user.id, {
                new: { name: user.name, email: user.email, role: user.role }
            })

            // 6. Retornar usuário sanitizado
            return sanitizeUser(user)

        } catch (error) {
            if (error instanceof ApiError) throw error

            // Tratar erros específicos do Prisma
            if (error.code === 'P2002') {
                throw new ApiError(USER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
            }

            throw new ApiError('Erro ao criar usuário', 500)
        }
    }

    // =================== READ ===================

    static async findMany(filters: UserFiltersInput): Promise<UsersListResponse> {
        try {
            const { search, role, isActive, createdAfter, createdBefore, page, limit, sortBy, sortOrder } = filters

            // Construir filtros WHERE
            const where = {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' as const } },
                        { email: { contains: search, mode: 'insensitive' as const } }
                    ]
                }),
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
                ...(createdAfter && { createdAt: { gte: createdAfter } }),
                ...(createdBefore && { createdAt: { lte: createdBefore } })
            }

            // Buscar dados e total em paralelo
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder }
                }),
                prisma.user.count({ where })
            ])

            // Calcular informações de paginação
            const pages = Math.ceil(total / limit)
            const hasNext = page < pages
            const hasPrev = page > 1

            return {
                data: users.map(sanitizeUser),
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                    hasNext,
                    hasPrev
                },
                filters
            }

        } catch (error) {
            throw new ApiError('Erro ao buscar usuários', 500)
        }
    }

    static async findById(id: number): Promise<UserResponse> {
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                throw new ApiError(USER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return sanitizeUser(user)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar usuário', 500)
        }
    }

    static async findByEmail(email: string): Promise<UserResponse | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            })

            return user ? sanitizeUser(user) : null

        } catch (error) {
            throw new ApiError('Erro ao buscar usuário por email', 500)
        }
    }

    // =================== UPDATE ===================

    static async update(id: number, data: UpdateUserInput, currentUserId: number): Promise<UserResponse> {
        try {
            // 1. Verificar se usuário existe
            const existingUser = await prisma.user.findUnique({ where: { id } })
            if (!existingUser) {
                throw new ApiError(USER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Impedir auto-alteração de role
            if (id === currentUserId && data.role && data.role !== existingUser.role) {
                throw new ApiError(USER_ERROR_MESSAGES.CANNOT_CHANGE_OWN_ROLE, 403)
            }

            // 3. Validar email único (se alterando)
            if (data.email && data.email !== existingUser.email) {
                await this.validateUniqueEmail(data.email, id)
            }

            // 4. Preparar dados para atualização
            const updateData = {
                ...data,
                ...(data.email && { email: data.email.toLowerCase() })
            }

            // 5. Atualizar usuário
            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData
            })

            // 6. Log da operação
            await this.logUserOperation(currentUserId, 'UPDATE', id, {
                old: { name: existingUser.name, email: existingUser.email, role: existingUser.role },
                new: { name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
            })

            return sanitizeUser(updatedUser)

        } catch (error) {
            if (error instanceof ApiError) throw error

            if (error.code === 'P2002') {
                throw new ApiError(USER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
            }

            throw new ApiError('Erro ao atualizar usuário', 500)
        }
    }

    // =================== PASSWORD MANAGEMENT ===================

    static async resetPassword(id: number, data: ResetPasswordInput, currentUserId: number): Promise<void> {
        try {
            // 1. Verificar se usuário existe
            const user = await prisma.user.findUnique({ where: { id } })
            if (!user) {
                throw new ApiError(USER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Validar força da senha
            if (!validateStrongPassword(data.password)) {
                throw new ApiError(USER_ERROR_MESSAGES.WEAK_PASSWORD, 400)
            }

            // 3. Hash da nova senha
            const hashedPassword = await bcrypt.hash(data.password, 12)

            // 4. Atualizar senha
            await prisma.user.update({
                where: { id },
                data: { password: hashedPassword }
            })

            // 5. Log da operação
            await this.logUserOperation(currentUserId, 'RESET_PASSWORD', id)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao redefinir senha', 500)
        }
    }

    // =================== STATUS MANAGEMENT ===================

    static async updateStatus(id: number, data: UpdateStatusInput, currentUserId: number): Promise<UserResponse> {
        try {
            // 1. Verificar se usuário existe
            const existingUser = await prisma.user.findUnique({ where: { id } })
            if (!existingUser) {
                throw new ApiError(USER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Impedir auto-desativação
            if (id === currentUserId && !data.isActive) {
                throw new ApiError(USER_ERROR_MESSAGES.CANNOT_DELETE_SELF, 403)
            }

            // 3. Atualizar status
            const updatedUser = await prisma.user.update({
                where: { id },
                data: { isActive: data.isActive }
            })

            // 4. Log da operação
            await this.logUserOperation(currentUserId, data.isActive ? 'ACTIVATE' : 'DEACTIVATE', id, {
                reason: data.reason,
                old: { isActive: existingUser.isActive },
                new: { isActive: updatedUser.isActive }
            })

            return sanitizeUser(updatedUser)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao atualizar status do usuário', 500)
        }
    }

    // =================== DELETE (SOFT DELETE) ===================

    static async delete(id: number, currentUserId: number, reason?: string): Promise<void> {
        try {
            // 1. Verificar se usuário existe
            const user = await prisma.user.findUnique({ where: { id } })
            if (!user) {
                throw new ApiError(USER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Impedir auto-exclusão
            if (id === currentUserId) {
                throw new ApiError(USER_ERROR_MESSAGES.CANNOT_DELETE_SELF, 403)
            }

            // 3. Soft delete (desativar usuário)
            await prisma.user.update({
                where: { id },
                data: { isActive: false }
            })

            // 4. Log da operação
            await this.logUserOperation(currentUserId, 'DELETE', id, {
                reason,
                old: { name: user.name, email: user.email, role: user.role, isActive: user.isActive }
            })

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao excluir usuário', 500)
        }
    }

    // =================== SEARCH AND FILTERS ===================

    static async search(query: string, limit: number = 10): Promise<UserResponse[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: limit,
                orderBy: { name: 'asc' }
            })

            return users.map(sanitizeUser)

        } catch (error) {
            throw new ApiError('Erro na busca de usuários', 500)
        }
    }

    static async getActiveUsers(): Promise<UserResponse[]> {
        try {
            const users = await prisma.user.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            })

            return users.map(sanitizeUser)

        } catch (error) {
            throw new ApiError('Erro ao buscar usuários ativos', 500)
        }
    }

    static async getUsersByRole(role: string): Promise<UserResponse[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    role: role as any,
                    isActive: true
                },
                orderBy: { name: 'asc' }
            })

            return users.map(sanitizeUser)

        } catch (error) {
            throw new ApiError('Erro ao buscar usuários por role', 500)
        }
    }

    // =================== ANALYTICS ===================

    static async getStatistics() {
        try {
            const [total, active, byRole] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isActive: true } }),
                prisma.user.groupBy({
                    by: ['role'],
                    _count: { role: true },
                    where: { isActive: true }
                })
            ])

            return {
                total,
                active,
                inactive: total - active,
                byRole: byRole.reduce((acc: { [x: string]: any }, item: { role: string | number; _count: { role: any } }) => {
                    acc[item.role] = item._count.role
                    return acc
                }, {} as Record<string, number>)
            }

        } catch (error) {
            throw new ApiError('Erro ao obter estatísticas de usuários', 500)
        }
    }

    // =================== PRIVATE METHODS ===================

    private static async validateUniqueEmail(email: string, excludeId?: number): Promise<void> {
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingUser && existingUser.id !== excludeId) {
            throw new ApiError(USER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
        }
    }

    private static async logUserOperation(
        currentUserId: number,
        action: string,
        targetUserId?: number,
        data?: any
    ): Promise<void> {
        try {
            // Implementar sistema de auditoria
            // Por enquanto apenas log no console, mas poderia ser salvo no banco
            console.log(`[USER_AUDIT] User ${currentUserId} performed ${action} on user ${targetUserId}`, {
                timestamp: new Date(),
                currentUserId,
                action,
                targetUserId,
                data
            })

            // TODO: Implementar tabela de auditoria no banco se necessário
            // await prisma.auditLog.create({
            //   data: {
            //     userId: currentUserId,
            //     action,
            //     module: 'USERS',
            //     resourceId: targetUserId,
            //     metadata: data
            //   }
            // })

        } catch (error) {
            // Log de auditoria não deve impedir a operação principal
            console.error('Erro ao registrar log de auditoria:', error)
        }
    }

    // =================== UTILITIES ===================

    static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword)
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12)
    }

    static formatUserForSelect(user: User): { value: number; label: string; role: string } {
        return {
            value: user.id,
            label: `${user.name} (${user.email})`,
            role: user.role
        }
    }
}