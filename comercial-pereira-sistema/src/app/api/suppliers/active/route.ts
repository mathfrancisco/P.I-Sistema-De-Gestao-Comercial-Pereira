import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, handleApiError } from '@/lib/api-auth'
import { SupplierService } from '@/lib/services/suppliers'

// GET /api/suppliers/active - Listar fornecedores ativos (todos os roles)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Buscar fornecedores ativos
        const suppliers = await SupplierService.getActiveSuppliers()

        // 3. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: suppliers
        })

    } catch (error) {
        console.error('❌ GET /api/suppliers/active error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}