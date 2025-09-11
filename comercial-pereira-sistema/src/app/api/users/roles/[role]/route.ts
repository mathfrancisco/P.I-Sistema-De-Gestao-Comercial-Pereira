import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { UserService } from '@/lib/services/users'
import { UserRoleEnum } from '@/lib/validations/users'

interface RouteParams {
    params: { role: string }
}

// GET /api/users/roles/[role] - Listar usuários por role (ADMIN e MANAGER)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Validar role
        const role = UserRoleEnum.parse(params.role.toUpperCase())

        // 3. Buscar usuários por role
        const users = await UserService.getUsersByRole(role)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: users,
            role
        })

    } catch (error) {
        console.error(`❌ GET /api/users/roles/${params.role} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}