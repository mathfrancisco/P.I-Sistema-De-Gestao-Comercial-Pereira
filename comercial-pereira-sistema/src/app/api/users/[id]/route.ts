import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService, ApiError } from '@/lib/services/users'
import {
    updateUserSchema,
    userIdSchema,
    UpdateUserInput,
    UserIdInput
} from '@/lib/validations/users'

interface RouteParams {
    params: { id: string }
}

// GET /api/users/[id] - Buscar usuário por ID (apenas ADMIN)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Validar parâmetro ID
        const { id }: UserIdInput = userIdSchema.parse({ id: params.id })

        // 3. Buscar usuário
        const user = await UserService.findById(id)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: user
        })

    } catch (error) {
        console.error(`❌ GET /api/users/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// PUT /api/users/[id] - Atualizar usuário (apenas ADMIN)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Validar parâmetro ID
        const { id }: UserIdInput = userIdSchema.parse({ id: params.id })

        // 3. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const updateData: UpdateUserInput = updateUserSchema.parse(body)

        // 4. Atualizar usuário
        const updatedUser = await UserService.update(id, updateData, parseInt(currentUser.id))

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Usuário atualizado com sucesso'
        })

    } catch (error) {
        console.error(`❌ PUT /api/users/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// DELETE /api/users/[id] - Excluir usuário (soft delete - apenas ADMIN)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Validar parâmetro ID
        const { id }: UserIdInput = userIdSchema.parse({ id: params.id })

        // 3. Extrair motivo da requisição (opcional)
        const body = await request.json().catch(() => ({}))
        const reason = body.reason || 'Exclusão administrativa'

        // 4. Excluir usuário (soft delete)
        await UserService.delete(id, parseInt(currentUser.id), reason)

        // 5. Resposta de sucesso
        return NextResponse.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        })

    } catch (error) {
        console.error(`❌ DELETE /api/users/${params.id} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}