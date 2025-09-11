import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService } from '@/lib/services/users'

// GET /api/users/stats - Estatísticas de usuários (apenas ADMIN)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Obter estatísticas
        const stats = await UserService.getStatistics()

        // 3. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: stats
        })

    } catch (error) {
        console.error('❌ GET /api/users/stats error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}