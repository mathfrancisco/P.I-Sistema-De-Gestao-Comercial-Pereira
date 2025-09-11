import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"

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

    // Buscar venda
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    if (user.role === 'SALESPERSON' && sale.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'Acesso negado para completar esta venda' },
        { status: 403 }
      )
    }

    // Verificar se venda pode ser completada
    if (sale.status !== 'CONFIRMED') {
      return NextResponse.json(
        { 
          error: 'Venda não pode ser completada',
          currentStatus: sale.status,
          expectedStatus: 'CONFIRMED'
        },
        { status: 409 }
      )
    }

    // Completar venda
    const completedSale = await prisma.sale.update({
      where: { id: saleId },
      data: { 
        status: 'COMPLETED',
        saleDate: new Date() // Atualizar data de conclusão
      }
    })

    console.log(`✅ [${user.role}] ${user.email} completou venda ID: ${saleId}`)

    return NextResponse.json({
      message: 'Venda completada com sucesso',
      sale: {
        id: completedSale.id,
        status: completedSale.status,
        total: completedSale.total,
        saleDate: completedSale.saleDate,
        customer: sale.customer.name,
        itemCount: sale.items.length
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
