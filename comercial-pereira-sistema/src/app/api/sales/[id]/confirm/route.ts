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

    // Buscar venda com itens
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true
              }
            }
          }
        },
        customer: {
          select: { name: true }
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
        { error: 'Acesso negado para confirmar esta venda' },
        { status: 403 }
      )
    }

    // Verificar se venda pode ser confirmada
    if (sale.status !== 'PENDING') {
      return NextResponse.json(
        { 
          error: 'Venda não pode ser confirmada',
          currentStatus: sale.status,
          expectedStatus: 'PENDING'
        },
        { status: 409 }
      )
    }

    // Verificar se há itens na venda
    if (sale.items.length === 0) {
      return NextResponse.json(
        { error: 'Venda deve ter pelo menos um item para ser confirmada' },
        { status: 400 }
      )
    }

    // Re-validar estoque (para evitar overselling)
    const stockErrors = []
    for (const item of sale.items) {
      if (item.product.inventory && item.product.inventory.quantity < item.quantity) {
        stockErrors.push({
          productId: item.productId,
          productName: item.product.name,
          requested: item.quantity,
          available: item.product.inventory.quantity
        })
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Estoque insuficiente para alguns produtos',
          stockErrors
        },
        { status: 400 }
      )
    }

    // Confirmar venda e reservar estoque
    const confirmedSale = await prisma.$transaction(async (tx: { inventory: { update: (arg0: { where: { productId: any }; data: { quantity: { decrement: any } } }) => any }; sale: { update: (arg0: { where: { id: number }; data: { status: string }; include: { customer: { select: { name: boolean } }; items: { include: { product: { select: { name: boolean } } } } } }) => any } }) => {
      // Reservar estoque (decrementar)
      for (const item of sale.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity }
          }
        })
      }

      // Atualizar status da venda
      return await tx.sale.update({
        where: { id: saleId },
        data: { status: 'CONFIRMED' },
        include: {
          customer: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      })
    })

    console.log(`✅ [${user.role}] ${user.email} confirmou venda ID: ${saleId}`)

    return NextResponse.json({
      message: 'Venda confirmada e estoque reservado com sucesso',
      sale: {
        id: confirmedSale.id,
        status: confirmedSale.status,
        total: confirmedSale.total,
        customer: confirmedSale.customer.name,
        itemCount: confirmedSale.items.length
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
