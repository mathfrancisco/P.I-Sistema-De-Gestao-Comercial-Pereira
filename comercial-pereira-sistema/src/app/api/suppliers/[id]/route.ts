import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService, ApiError } from '@/lib/services/suppliers'
import {
    updateSupplierSchema,
    supplierIdSchema,
    UpdateSupplierInput,
    SupplierIdInput
} from '@/lib/validations/suppliers'

interface RouteParams {
    params: { id: string }
}

// GET /api/suppliers/[id] - Buscar fornecedor por ID (todos os roles)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Validar parâmetro ID
        const { id }: SupplierIdInput = supplierIdSchema.parse({ id: params.id })

        // 3. Buscar fornecedor
        const supplier = await SupplierService.findById(id)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: supplier
        })

    } catch (error) {
        console.error(`❌ GET /api/suppliers/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// PUT /api/suppliers/[id] - Atualizar fornecedor (ADMIN e MANAGER)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Validar parâmetro ID
        const { id }: SupplierIdInput = supplierIdSchema.parse({ id: params.id })

        // 3. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const updateData: UpdateSupplierInput = updateSupplierSchema.parse(body)

        // 4. Atualizar fornecedor
        const updatedSupplier = await SupplierService.update(id, updateData, parseInt(currentUser.id))

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: updatedSupplier,
            message: 'Fornecedor atualizado com sucesso'
        })

    } catch (error) {
        console.error(`❌ PUT /api/suppliers/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// DELETE /api/suppliers/[id] - Excluir fornecedor (ADMIN e MANAGER)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Validar parâmetro ID
        const { id }: SupplierIdInput = supplierIdSchema.parse({ id: params.id })

        // 3. Extrair motivo da requisição (opcional)
        const body = await request.json().catch(() => ({}))
        const reason = body.reason || 'Exclusão administrativa'

        // 4. Excluir fornecedor (soft delete)
        await SupplierService.delete(id, parseInt(currentUser.id), reason)

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            message: 'Fornecedor excluído com sucesso'
        })

    } catch (error) {
        console.error(`❌ DELETE /api/suppliers/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}