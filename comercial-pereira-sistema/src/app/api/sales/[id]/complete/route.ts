import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const saleId = parseInt(params.id)
    
    if (isNaN(saleId)) {
      return NextResponse.json(
        { error: 'ID da venda inválido' },
        { status: 400 }
      )
    }

    // Usar service para completar venda
    const result = await saleService.completeSale(saleId, user)

    console.log(`✅ [${user.role}] ${user.email} completou venda ID: ${saleId}`)

    return NextResponse.json(result)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}