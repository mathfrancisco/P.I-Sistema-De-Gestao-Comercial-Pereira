import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, handleApiError } from '@/lib/api-auth'
import { SupplierService, ApiError } from '@/lib/services/suppliers'
import { supplierIdSchema, SupplierIdInput } from '@/lib/validations/suppliers'

interface RouteParams {
    params: { id: string }
}

// GET /api/suppliers/[id]/products - Buscar fornecedor com produtos (todos os roles)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Validar parâmetro ID
        const { id }: SupplierIdInput = supplierIdSchema.parse({ id: params.id })

        // 3. Buscar fornecedor com produtos
        const supplierWithProducts = await SupplierService.findWithProducts(id)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: supplierWithProducts
        })

    } catch (error) {
        console.error(`❌ GET /api/suppliers/${params.id}/products error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}