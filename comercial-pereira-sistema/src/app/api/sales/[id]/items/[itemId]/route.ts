import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"

interface RouteParams {
  params: {
    id: string
    itemId: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const saleId = parseInt(params.id)
    const itemId = parseInt(params.itemId)
    
    if (isNaN(saleId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID da venda ou item inválido' },
        { status: 400 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()

    // Usar service para atualizar item
    const updatedItem = await saleService.updateSaleItem(saleId, itemId, body, user)

    console.log(`✅ [${user.role}] ${user.email} atualizou item ${itemId} da venda ${saleId}`)

    return NextResponse.json(updatedItem)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const saleId = parseInt(params.id)
    const itemId = parseInt(params.itemId)
    
    if (isNaN(saleId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID da venda ou item inválido' },
        { status: 400 }
      )
    }

    // Usar service para remover item
    const result = await saleService.removeSaleItem(saleId, itemId, user)

    console.log(`✅ [${user.role}] ${user.email} removeu item ${itemId} da venda ${saleId}`)

    return NextResponse.json(result)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}