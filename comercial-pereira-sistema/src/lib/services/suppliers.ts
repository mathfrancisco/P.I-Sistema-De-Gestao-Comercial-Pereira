// lib/services/suppliers.ts
import { prisma } from '@/lib/db'
import { Supplier } from '@prisma/client'
import {
    CreateSupplierInput,
    UpdateSupplierInput,
    SupplierFiltersInput,
    SupplierSearchInput,
    SupplierResponse,
    SuppliersListResponse,
    SupplierWithProducts,
    validateCNPJ,
    formatCNPJ,
    formatPhone,
    formatCEP,
    SUPPLIER_ERROR_MESSAGES
} from '@/lib/validations/suppliers'

export class ApiError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message)
        this.name = 'ApiError'
    }
}

export class SupplierService {
    // =================== CREATE ===================

    static async create(data: CreateSupplierInput, currentUserId: number): Promise<SupplierResponse> {
        try {
            // Validate required fields
            if (!data.name || !data.name.trim()) {
                throw new ApiError('Nome do fornecedor é obrigatório', 400)
            }

            // 1. Formatar dados de entrada
            const formattedData = this.formatSupplierData(data)

            // Ensure name is present for create operation
            if (!formattedData.name) {
                throw new ApiError('Nome do fornecedor é obrigatório', 400)
            }

            // 2. Validar CNPJ se fornecido
            if (formattedData.cnpj && !validateCNPJ(formattedData.cnpj)) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.CNPJ_INVALID, 400)
            }

            // 3. Validar email único
            if (formattedData.email) {
                await this.validateUniqueEmail(formattedData.email)
            }

            // 4. Validar CNPJ único
            if (formattedData.cnpj) {
                await this.validateUniqueCNPJ(formattedData.cnpj)
            }

            // 5. Criar fornecedor no banco
            const supplier = await prisma.supplier.create({
                data: formattedData as any // Type assertion as temporary fix until Prisma client is regenerated
            })

            // 6. Log da operação
            await this.logSupplierOperation(currentUserId, 'CREATE', supplier.id, {
                new: {
                    name: supplier.name,
                    email: supplier.email,
                    cnpj: supplier.cnpj
                }
            })

            return this.formatSupplierResponse(supplier)

        } catch (error: unknown) {
            if (error instanceof ApiError) throw error

            // Tratar erros específicos do Prisma
            if (error && typeof error === 'object' && 'code' in error) {
                const prismaError = error as { code: string; meta?: { target?: string[] } }
                
                if (prismaError.code === 'P2002') {
                    const field = prismaError.meta?.target?.[0]
                    if (field === 'email') {
                        throw new ApiError(SUPPLIER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
                    } else if (field === 'cnpj') {
                        throw new ApiError(SUPPLIER_ERROR_MESSAGES.CNPJ_IN_USE, 409)
                    }
                }
            }

            throw new ApiError('Erro ao criar fornecedor', 500)
        }
    }

    // =================== READ ===================

    static async findMany(filters: SupplierFiltersInput): Promise<SuppliersListResponse> {
        try {
            const {
                search,
                isActive,
                state,
                hasEmail,
                hasPhone,
                hasCnpj,
                createdAfter,
                createdBefore,
                page,
                limit,
                sortBy,
                sortOrder
            } = filters

            // Construir filtros WHERE
            const where = {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' as const } },
                        { contactPerson: { contains: search, mode: 'insensitive' as const } },
                        { email: { contains: search, mode: 'insensitive' as const } },
                        { city: { contains: search, mode: 'insensitive' as const } }
                    ]
                }),
                ...(isActive !== undefined && { isActive }),
                ...(state && { state }),
                ...(hasEmail !== undefined && hasEmail && { email: { not: null } }),
                ...(hasEmail !== undefined && !hasEmail && { email: null }),
                ...(hasPhone !== undefined && hasPhone && { phone: { not: null } }),
                ...(hasPhone !== undefined && !hasPhone && { phone: null }),
                ...(hasCnpj !== undefined && hasCnpj && { cnpj: { not: null } }),
                ...(hasCnpj !== undefined && !hasCnpj && { cnpj: null }),
                ...(createdAfter && { createdAt: { gte: createdAfter } }),
                ...(createdBefore && { createdAt: { lte: createdBefore } })
            }

            // Buscar dados e total em paralelo
            const [suppliers, total] = await Promise.all([
                prisma.supplier.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder }
                }),
                prisma.supplier.count({ where })
            ])

            // Calcular informações de paginação
            const pages = Math.ceil(total / limit)
            const hasNext = page < pages
            const hasPrev = page > 1

            return {
                data: suppliers.map(this.formatSupplierResponse),
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
            throw new ApiError('Erro ao buscar fornecedores', 500)
        }
    }

    static async findById(id: number): Promise<SupplierResponse> {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id }
            })

            if (!supplier) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return this.formatSupplierResponse(supplier)

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar fornecedor', 500)
        }
    }

    static async findWithProducts(id: number): Promise<SupplierWithProducts> {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                include: {
                    products: {
                        where: { isActive: true },
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            price: true,
                            isActive: true
                        },
                        orderBy: { name: 'asc' }
                    },
                    _count: {
                        select: { products: true }
                    }
                }
            })

            if (!supplier) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            return {
                ...this.formatSupplierResponse(supplier),
                products: supplier.products.map(product => ({
                    ...product,
                    price: Number(product.price)
                })),
                _count: supplier._count
            }

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao buscar fornecedor com produtos', 500)
        }
    }

    // =================== UPDATE ===================

    static async update(id: number, data: UpdateSupplierInput, currentUserId: number): Promise<SupplierResponse> {
        try {
            // 1. Verificar se fornecedor existe
            const existingSupplier = await prisma.supplier.findUnique({ where: { id } })
            if (!existingSupplier) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Formatar dados de entrada
            const formattedData = this.formatSupplierData(data)

            // 3. Validar CNPJ se fornecido
            if (formattedData.cnpj && !validateCNPJ(formattedData.cnpj)) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.CNPJ_INVALID, 400)
            }

            // 4. Validar email único (se alterando)
            if (formattedData.email && formattedData.email !== existingSupplier.email) {
                await this.validateUniqueEmail(formattedData.email, id)
            }

            // 5. Validar CNPJ único (se alterando)
            if (formattedData.cnpj && formattedData.cnpj !== existingSupplier.cnpj) {
                await this.validateUniqueCNPJ(formattedData.cnpj, id)
            }

            // 6. Atualizar fornecedor
            const updatedSupplier = await prisma.supplier.update({
                where: { id },
                data: formattedData
            })

            // 7. Log da operação
            await this.logSupplierOperation(currentUserId, 'UPDATE', id, {
                old: {
                    name: existingSupplier.name,
                    email: existingSupplier.email,
                    cnpj: existingSupplier.cnpj
                },
                new: {
                    name: updatedSupplier.name,
                    email: updatedSupplier.email,
                    cnpj: updatedSupplier.cnpj
                }
            })

            return this.formatSupplierResponse(updatedSupplier)

        } catch (error: unknown) {
            if (error instanceof ApiError) throw error

            if (error && typeof error === 'object' && 'code' in error) {
                const prismaError = error as { code: string; meta?: { target?: string[] } }
                
                if (prismaError.code === 'P2002') {
                    const field = prismaError.meta?.target?.[0]
                    if (field === 'email') {
                        throw new ApiError(SUPPLIER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
                    } else if (field === 'cnpj') {
                        throw new ApiError(SUPPLIER_ERROR_MESSAGES.CNPJ_IN_USE, 409)
                    }
                }
            }

            throw new ApiError('Erro ao atualizar fornecedor', 500)
        }
    }

    // =================== DELETE (SOFT DELETE) ===================

    static async delete(id: number, currentUserId: number, reason?: string): Promise<void> {
        try {
            // 1. Verificar se fornecedor existe
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            })

            if (!supplier) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // 2. Verificar se tem produtos associados
            if (supplier._count.products > 0) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.HAS_PRODUCTS, 400)
            }

            // 3. Soft delete (desativar fornecedor)
            await prisma.supplier.update({
                where: { id },
                data: { isActive: false }
            })

            // 4. Log da operação
            await this.logSupplierOperation(currentUserId, 'DELETE', id, {
                reason,
                old: {
                    name: supplier.name,
                    email: supplier.email,
                    cnpj: supplier.cnpj,
                    isActive: supplier.isActive
                }
            })

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao excluir fornecedor', 500)
        }
    }

    // =================== SEARCH AND FILTERS ===================

    static async search(searchParams: SupplierSearchInput): Promise<SupplierResponse[]> {
        try {
            const { q, limit, includeInactive } = searchParams

            const suppliers = await prisma.supplier.findMany({
                where: {
                    ...(includeInactive ? {} : { isActive: true }),
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { contactPerson: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } },
                        { city: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: limit,
                orderBy: { name: 'asc' }
            })

            return suppliers.map(this.formatSupplierResponse)

        } catch (error) {
            throw new ApiError('Erro na busca de fornecedores', 500)
        }
    }

    static async getActiveSuppliers(): Promise<SupplierResponse[]> {
        try {
            const suppliers = await prisma.supplier.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            })

            return suppliers.map(this.formatSupplierResponse)

        } catch (error) {
            throw new ApiError('Erro ao buscar fornecedores ativos', 500)
        }
    }

    static async getSuppliersByState(state: string): Promise<SupplierResponse[]> {
        try {
            const suppliers = await prisma.supplier.findMany({
                where: {
                    state: state.toUpperCase(),
                    isActive: true
                },
                orderBy: { name: 'asc' }
            })

            return suppliers.map(this.formatSupplierResponse)

        } catch (error) {
            throw new ApiError('Erro ao buscar fornecedores por estado', 500)
        }
    }

    // =================== ANALYTICS ===================

    static async getStatistics() {
        try {
            const [total, active, byState, withProducts] = await Promise.all([
                prisma.supplier.count(),
                prisma.supplier.count({ where: { isActive: true } }),
                prisma.supplier.groupBy({
                    by: ['state'] as const, // Fix the typing issue
                    _count: { state: true },
                    where: {
                        isActive: true,
                        state: { not: null }
                    },
                    orderBy: { _count: { state: 'desc' } }
                }),
                prisma.supplier.count({
                    where: {
                        isActive: true,
                        products: { some: { isActive: true } }
                    }
                })
            ])

            return {
                total,
                active,
                inactive: total - active,
                withProducts,
                withoutProducts: active - withProducts,
                byState: byState.reduce((acc, item) => {
                    acc[item.state || 'N/A'] = item._count.state
                    return acc
                }, {} as Record<string, number>)
            }

        } catch (error: unknown) {
            throw new ApiError('Erro ao obter estatísticas de fornecedores', 500)
        }
    }

    static async getSupplierPerformance(id: number) {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                include: {
                    products: {
                        where: { isActive: true },
                        include: {
                            saleItems: {
                                where: {
                                    sale: { status: 'COMPLETED' }
                                },
                                select: {
                                    quantity: true,
                                    total: true,
                                    sale: {
                                        select: {
                                            saleDate: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!supplier) {
                throw new ApiError(SUPPLIER_ERROR_MESSAGES.NOT_FOUND, 404)
            }

            // Calcular métricas de performance
            let totalSales = 0
            let totalRevenue = 0
            let totalQuantity = 0
            let lastSaleDate: Date | null = null

            supplier.products.forEach(product => {
                product.saleItems.forEach(item => {
                    totalSales++
                    totalRevenue += Number(item.total)
                    totalQuantity += item.quantity

                    if (!lastSaleDate || item.sale.saleDate > lastSaleDate) {
                        lastSaleDate = item.sale.saleDate
                    }
                })
            })

            return {
                supplierId: id,
                supplierName: supplier.name,
                totalProducts: supplier.products.length,
                totalSales,
                totalRevenue,
                totalQuantity,
                averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
                lastSaleDate,
                isActive: supplier.isActive
            }

        } catch (error) {
            if (error instanceof ApiError) throw error
            throw new ApiError('Erro ao obter performance do fornecedor', 500)
        }
    }

    // =================== PRIVATE METHODS ===================

    private static formatSupplierData(data: CreateSupplierInput | UpdateSupplierInput) {
        // For create operations, ensure name is always a string
        // For update operations, name can be undefined
        const baseData = {
            ...(data.name !== undefined && { name: data.name.trim() }),
            ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson?.trim() || null }),
            ...(data.email !== undefined && { email: data.email?.toLowerCase().trim() || null }),
            ...(data.phone !== undefined && { phone: data.phone ? formatPhone(data.phone) : null }),
            ...(data.address !== undefined && { address: data.address?.trim() || null }),
            ...(data.city !== undefined && { city: data.city?.trim() || null }),
            ...(data.state !== undefined && { state: data.state?.toUpperCase() || null }),
            ...(data.zipCode !== undefined && { zipCode: data.zipCode ? formatCEP(data.zipCode) : null }),
            ...(data.cnpj !== undefined && { cnpj: data.cnpj ? formatCNPJ(data.cnpj) : null }),
            ...(data.website !== undefined && { website: data.website?.trim() || null }),
            ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
            ...(data.isActive !== undefined && { isActive: data.isActive })
        }

        return baseData
    }

    private static formatSupplierResponse(supplier: Supplier): SupplierResponse {
        return {
            id: supplier.id,
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            state: supplier.state,
            zipCode: supplier.zipCode,
            cnpj: supplier.cnpj,
            website: supplier.website,
            notes: supplier.notes,
            isActive: supplier.isActive,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt
        }
    }

    private static async validateUniqueEmail(email: string, excludeId?: number): Promise<void> {
        const existingSupplier = await prisma.supplier.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingSupplier && existingSupplier.id !== excludeId) {
            throw new ApiError(SUPPLIER_ERROR_MESSAGES.EMAIL_IN_USE, 409)
        }
    }

    private static async validateUniqueCNPJ(cnpj: string, excludeId?: number): Promise<void> {
        const formattedCNPJ = formatCNPJ(cnpj)
        const existingSupplier = await prisma.supplier.findUnique({
            where: { cnpj: formattedCNPJ }
        })

        if (existingSupplier && existingSupplier.id !== excludeId) {
            throw new ApiError(SUPPLIER_ERROR_MESSAGES.CNPJ_IN_USE, 409)
        }
    }

    private static async logSupplierOperation(
        currentUserId: number,
        action: string,
        targetSupplierId?: number,
        data?: any
    ): Promise<void> {
        try {
            // Log de auditoria
            console.log(`[SUPPLIER_AUDIT] User ${currentUserId} performed ${action} on supplier ${targetSupplierId}`, {
                timestamp: new Date(),
                currentUserId,
                action,
                targetSupplierId,
                data
            })

            // TODO: Implementar tabela de auditoria no banco se necessário

        } catch (error) {
            // Log de auditoria não deve impedir a operação principal
            console.error('Erro ao registrar log de auditoria:', error)
        }
    }

    // =================== UTILITIES ===================

    static formatSupplierForSelect(supplier: Supplier): { value: number; label: string; isActive: boolean } {
        return {
            value: supplier.id,
            label: `${supplier.name}${supplier.city ? ` - ${supplier.city}` : ''}`,
            isActive: supplier.isActive
        }
    }

    static async checkSupplierExists(id: number): Promise<boolean> {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                select: { id: true }
            })
            return !!supplier
        } catch {
            return false
        }
    }
}