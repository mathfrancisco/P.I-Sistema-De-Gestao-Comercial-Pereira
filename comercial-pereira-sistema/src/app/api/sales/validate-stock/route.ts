import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()

    // Validar dados de entrada
    const body = await request.json()

    // Usar service para validar estoque
    const result = await saleService.validateStock(body, user)

    console.log(`✅ [${user.role}] ${user.email} validou estoque para ${result.totalItems} itens`)

    return NextResponse.json(result)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}