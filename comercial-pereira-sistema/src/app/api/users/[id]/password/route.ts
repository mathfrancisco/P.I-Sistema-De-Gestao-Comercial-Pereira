import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService, ApiError } from '@/lib/services/users'
import {
    resetPasswordSchema,
    userIdSchema,
    ResetPasswordInput,
    UserIdInput
} from '@/lib/validations/users'

interface RouteParams {
    params: { id: string }
}

// PUT /api/users/[id]/password - Redefinir senha (apenas ADMIN)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Validar parâmetro ID
        const { id }: UserIdInput = userIdSchema.parse({ id: params.id })

        // 3. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const passwordData: ResetPasswordInput = resetPasswordSchema.parse(body)

        // 4. Redefinir senha
        await UserService.resetPassword(id, passwordData, parseInt(currentUser.id))

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            message: 'Senha redefinida com sucesso'
        })

    } catch (error) {
        console.error(`❌ PUT /api/users/${params.id}/password error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}