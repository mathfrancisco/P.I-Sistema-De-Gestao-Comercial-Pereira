import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService, ApiError } from '@/lib/services/suppliers'
import { supplierIdSchema, SupplierIdInput } from '@/lib/validations/suppliers'

interface RouteParams {
    params: { id: string }
}

// GET /api/suppliers/performance/[id] - Performance do fornecedor (ADMIN e MANAGER)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização (apenas ADMIN e MANAGER para performance)
        const currentUser = await requireAdminOrManager()

        // 2. Validar parâmetro ID
        const { id }: SupplierIdInput = supplierIdSchema.parse({ id: params.id })

        // 3. Obter performance do fornecedor
        const performance = await SupplierService.getSupplierPerformance(id)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: performance
        })

    } catch (error) {
        console.error(`❌ GET /api/suppliers/performance/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}
