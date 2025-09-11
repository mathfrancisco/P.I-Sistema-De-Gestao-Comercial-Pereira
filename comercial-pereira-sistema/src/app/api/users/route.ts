import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleApiError } from '@/lib/api-auth'
import { UserService,  } from '@/lib/services/users'
import {
    createUserSchema,
    userFiltersSchema,
    CreateUserInput,
    UserFiltersInput
} from '@/lib/validations/users'

// GET /api/users - Listar usuários (apenas ADMIN)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Extrair e validar parâmetros de query
        const searchParams = request.nextUrl.searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        const filters: UserFiltersInput = userFiltersSchema.parse(queryParams)

        // 3. Buscar usuários
        const result = await UserService.findMany(filters)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            ...result
        })

    } catch (error) {
        console.error('❌ GET /api/users error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}

// POST /api/users - Criar usuário (apenas ADMIN)
export async function POST(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdmin()

        // 2. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const userData: CreateUserInput = createUserSchema.parse(body)

        // 3. Criar usuário
        const newUser = await UserService.create(userData, parseInt(currentUser.id))

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: newUser,
            message: 'Usuário criado com sucesso'
        }, { status: 201 })

    } catch (error) {
        console.error('❌ POST /api/users error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}