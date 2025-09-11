import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService } from '@/lib/services/users'
import { z } from 'zod'

const searchSchema = z.object({
    q: z.string().min(2, "Query deve ter pelo menos 2 caracteres").max(100),
    limit: z.coerce.number().min(1).max(50).default(10)
})

// GET /api/users/search - Buscar usuários (apenas ADMIN)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Extrair e validar parâmetros de busca
        const searchParams = request.nextUrl.searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        const { q, limit } = searchSchema.parse(queryParams)

        // 3. Realizar busca
        const users = await UserService.search(q, limit)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: users,
            query: q,
            limit
        })

    } catch (error) {
        console.error('❌ GET /api/users/search error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}
