import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { UserService } from '@/lib/services/users'

// GET /api/users/active - Listar usuários ativos (ADMIN e MANAGER)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização (Manager pode listar usuários ativos para relatórios)
        const currentUser = await requireAdminOrManager()

        // 2. Buscar usuários ativos
        const users = await UserService.getActiveUsers()

        // 3. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: users
        })

    } catch (error) {
        console.error('❌ GET /api/users/active error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}