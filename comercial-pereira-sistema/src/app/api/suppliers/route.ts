import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService, ApiError } from '@/lib/services/suppliers'
import {
    createSupplierSchema,
    supplierFiltersSchema,
    CreateSupplierInput,
    SupplierFiltersInput
} from '@/lib/validations/suppliers'

// GET /api/suppliers - Listar fornecedores (todos os roles)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Extrair e validar parâmetros de query
        const searchParams = request.nextUrl.searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        const filters: SupplierFiltersInput = supplierFiltersSchema.parse(queryParams)

        // 3. Buscar fornecedores
        const result = await SupplierService.findMany(filters)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            ...result
        })

    } catch (error) {
        console.error('❌ GET /api/suppliers error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// POST /api/suppliers - Criar fornecedor (ADMIN e MANAGER)
export async function POST(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const supplierData: CreateSupplierInput = createSupplierSchema.parse(body)

        // 3. Criar fornecedor
        const newSupplier = await SupplierService.create(supplierData, parseInt(currentUser.id))

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: newSupplier,
            message: 'Fornecedor criado com sucesso'
        }, { status: 201 })

    } catch (error) {
        console.error('❌ POST /api/suppliers error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}