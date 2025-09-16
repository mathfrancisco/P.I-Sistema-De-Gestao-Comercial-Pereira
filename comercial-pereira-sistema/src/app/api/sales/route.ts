import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"
import { saleFiltersSchema } from "@/lib/validations/sale"

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const user = await getAuthenticatedUser()

        // Extrair e validar parâmetros de busca
        const { searchParams } = new URL(request.url)
        const rawParams = Object.fromEntries(searchParams)

        // Validar e converter tipos usando o schema
        const validatedParams = saleFiltersSchema.parse(rawParams)

        // Usar service para listar vendas
        const result = await saleService.listSales(validatedParams, user)

        console.log(`✅ [${user.role}] ${user.email} listou ${result.data.length} vendas`)

        return NextResponse.json(result)

    } catch (error: any) {
        const { error: errorMessage, statusCode } = handleApiError(error)
        return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const user = await getAuthenticatedUser()

        // Validar dados de entrada
        const body = await request.json()

        // Usar service para criar venda
        const sale = await saleService.createSale(body, user)

        console.log(`✅ [${user.role}] ${user.email} criou venda ID: ${sale.id}`)

        return NextResponse.json(sale, { status: 201 })

    } catch (error: any) {
        const { error: errorMessage, statusCode } = handleApiError(error)
        return NextResponse.json({
            error: errorMessage,
            ...(error.details && { details: error.details })
        }, { status: statusCode })
    }
}