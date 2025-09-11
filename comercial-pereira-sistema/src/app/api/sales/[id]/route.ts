import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { updateSaleSchema } from "@/lib/validations/sale"

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

    // Buscar venda
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, role: true }
        },
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { name: true }
                },
                inventory: {
                  select: { quantity: true }
                }
              }
            }
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

    // Verificar permissões (vendedores só veem suas vendas)
    if (user.role === 'SALESPERSON' && sale.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'Acesso negado a esta venda' },
        { status: 403 }
      )
    }

    console.log(`✅ [${user.role}] ${user.email} consultou venda ID: ${sale.id}`)

    return NextResponse.json(sale)

  } catch (error) {
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
    const validatedData = updateSaleSchema.parse(body)

    // Verificar se venda existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId }
    })

    if (!existingSale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões (vendedores só editam suas vendas)
    if (user.role === 'SALESPERSON' && existingSale.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'Acesso negado para editar esta venda' },
        { status: 403 }
      )
    }

    // Verificar se venda pode ser editada (apenas DRAFT e PENDING)
    if (!['DRAFT', 'PENDING'].includes(existingSale.status)) {
      return NextResponse.json(
        { 
          error: 'Venda não pode ser editada',
          currentStatus: existingSale.status,
          editableStatuses: ['DRAFT', 'PENDING']
        },
        { status: 409 }
      )
    }

    // Verificar se cliente existe (se está sendo alterado)
    if (validatedData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId, isActive: true }
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Cliente não encontrado ou inativo' },
          { status: 400 }
        )
      }
    }

    // Atualizar venda
    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        ...(validatedData.customerId && { customerId: validatedData.customerId }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.discount !== undefined && { discount: validatedData.discount }),
        ...(validatedData.tax !== undefined && { tax: validatedData.tax })
      },
      include: {
        customer: {
          select: { id: true, name: true, type: true }
        },
        user: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true }
            }
          }
        }
      }
    })

    console.log(`✅ [${user.role}] ${user.email} atualizou venda ID: ${updatedSale.id}`)

    return NextResponse.json(updatedSale)

  } catch (error) {
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

    // Verificar se venda existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: { select: { name: true } }
      }
    })

    if (!existingSale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    if (user.role === 'SALESPERSON' && existingSale.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'Acesso negado para cancelar esta venda' },
        { status: 403 }
      )
    }

    // Verificar se venda pode ser cancelada
    if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(existingSale.status)) {
      return NextResponse.json(
        { 
          error: 'Venda não pode ser cancelada',
          currentStatus: existingSale.status
        },
        { status: 409 }
      )
    }

    // Cancelar venda (liberar estoque se estava reservado)
    const cancelledSale = await prisma.$transaction(async (tx) => {
      // Se venda estava confirmada, liberar estoque
      if (existingSale.status === 'CONFIRMED') {
        const saleItems = await tx.saleItem.findMany({
          where: { saleId: saleId }
        })

        for (const item of saleItems) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              quantity: { increment: item.quantity }
            }
          })
        }
      }

      // Atualizar status para cancelado
      return await tx.sale.update({
        where: { id: saleId },
        data: { status: 'CANCELLED' }
      })
    })

    console.log(`✅ [${user.role}] ${user.email} cancelou venda ID: ${saleId}`)

    return NextResponse.json({
      message: 'Venda cancelada com sucesso',
      sale: {
        id: cancelledSale.id,
        status: cancelledSale.status,
        customer: existingSale.customer.name
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
