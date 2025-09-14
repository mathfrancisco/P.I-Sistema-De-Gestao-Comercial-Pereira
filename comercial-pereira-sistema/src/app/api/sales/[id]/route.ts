import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { saleService } from "@/lib/services/sale"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Usar service para buscar venda
    const sale = await saleService.getSaleById(saleId, user)

    console.log(`✅ [${user.role}] ${user.email} consultou venda ID: ${sale.id}`)

    return NextResponse.json(sale)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Validar dados de entrada
    const body = await request.json()

    // Usar service para atualizar venda
    const sale = await saleService.updateSale(saleId, body, user)

    console.log(`✅ [${user.role}] ${user.email} atualizou venda ID: ${sale.id}`)

    return NextResponse.json(sale)

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
    
    if (isNaN(saleId)) {
      return NextResponse.json(
        { error: 'ID da venda inválido' },
        { status: 400 }
      )
    }

    // Usar service para cancelar venda
    const result = await saleService.cancelSale(saleId, user)

    console.log(`✅ [${user.role}] ${user.email} cancelou venda ID: ${saleId}`)

    return NextResponse.json(result)

  } catch (error: any) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
