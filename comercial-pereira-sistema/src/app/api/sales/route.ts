import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)

    // Usar service para listar vendas
    const result = await saleService.listSales(params, user)

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