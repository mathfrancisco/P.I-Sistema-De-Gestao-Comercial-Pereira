import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService } from '@/lib/services/suppliers'

// GET /api/suppliers/stats - Estatísticas de fornecedores (ADMIN e MANAGER)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização (apenas ADMIN e MANAGER para estatísticas)
        const currentUser = await requireAdminOrManager()

        // 2. Obter estatísticas
        const stats = await SupplierService.getStatistics()

        // 3. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: stats
        })

    } catch (error) {
        console.error('❌ GET /api/suppliers/stats error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}