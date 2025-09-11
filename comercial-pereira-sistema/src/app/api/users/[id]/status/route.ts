import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService, ApiError } from '@/lib/services/users'
import {
    updateStatusSchema,
    userIdSchema,
    UpdateStatusInput,
    UserIdInput
} from '@/lib/validations/users'

interface RouteParams {
    params: { id: string }
}

// PUT /api/users/[id]/status - Alterar status do usuário (apenas ADMIN)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Validar parâmetro ID
        const { id }: UserIdInput = userIdSchema.parse({ id: params.id })

        // 3. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const statusData: UpdateStatusInput = updateStatusSchema.parse(body)

        // 4. Atualizar status
        const updatedUser = await UserService.updateStatus(id, statusData, parseInt(currentUser.id))

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: `Usuário ${statusData.isActive ? 'ativado' : 'desativado'} com sucesso`
        })

    } catch (error) {
        console.error(`❌ PUT /api/users/${params.id}/status error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}