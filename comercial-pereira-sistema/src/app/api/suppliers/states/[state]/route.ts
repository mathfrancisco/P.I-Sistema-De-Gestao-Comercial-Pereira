import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, handleApiError } from '@/lib/api-auth'
import { SupplierService } from '@/lib/services/suppliers'
import { z } from 'zod'

const stateSchema = z.object({
    state: z.string()
        .length(2, "Estado deve ter 2 caracteres")
        .regex(/^[A-Z]{2}$/, "Estado deve ser em maiúsculas")
})

interface RouteParams {
    params: { state: string }
}

// GET /api/suppliers/states/[state] - Fornecedores por estado (todos os roles)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Validar parâmetro state
        const { state } = stateSchema.parse({ state: params.state.toUpperCase() })

        // 3. Buscar fornecedores por estado
        const suppliers = await SupplierService.getSuppliersByState(state)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: suppliers,
            state
        })

    } catch (error) {
        console.error(`❌ GET /api/suppliers/states/${params.state} error:`, error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}