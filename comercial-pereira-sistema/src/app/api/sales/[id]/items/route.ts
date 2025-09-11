import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { addSaleItemSchema, calculateItemTotal } from "@/lib/validations/sale"

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

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = addSaleItemSchema.parse(body)

    // Verificar se venda existe e pode ser editada
    const sale = await prisma.sale.findUnique({
      where: { id: saleId }
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
        { error: 'Acesso negado para editar esta venda' },
        { status: 403 }
      )
    }

    // Verificar se venda pode ser editada
    if (!['DRAFT', 'PENDING'].includes(sale.status)) {
      return NextResponse.json(
        { 
          error: 'Não é possível adicionar itens a esta venda',
          currentStatus: sale.status
        },
        { status: 409 }
      )
    }

    // Verificar se produto existe e está ativo
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId, isActive: true },
      include: {
        inventory: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado ou inativo' },
        { status: 400 }
      )
    }

    // Verificar estoque disponível
    if (product.inventory && product.inventory.quantity < validatedData.quantity) {
      return NextResponse.json(
        { 
          error: 'Estoque insuficiente',
          productName: product.name,
          requested: validatedData.quantity,
          available: product.inventory.quantity
        },
        { status: 400 }
      )
    }

    // Verificar se produto já está na venda
    const existingItem = await prisma.saleItem.findFirst({
      where: {
        saleId: saleId,
        productId: validatedData.productId
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { 
          error: 'Produto já está na venda. Use PUT para atualizar a quantidade.',
          existingItem: {
            id: existingItem.id,
            quantity: existingItem.quantity
          }
        },
        { status: 409 }
      )
    }

    // Calcular preço e total
    const unitPrice = validatedData.unitPrice || Number(product.price)
    const total = calculateItemTotal(validatedData.quantity, unitPrice, validatedData.discount)

    // Adicionar item à venda com transação
    const saleItem = await prisma.$transaction(async (tx: { saleItem: { create: (arg0: { data: { saleId: number; productId: number; quantity: number; unitPrice: number; discount: number; total: number }; include: { product: { select: { id: boolean; name: boolean; code: boolean } } } }) => any; findMany: (arg0: { where: { saleId: number } }) => any }; sale: { update: (arg0: { where: { id: number }; data: { total: number } }) => any } }) => {
      // Criar item
      const newItem = await tx.saleItem.create({
        data: {
          saleId: saleId,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          unitPrice: unitPrice,
          discount: validatedData.discount,
          total: total
        },
        include: {
          product: {
            select: { id: true, name: true, code: true }
          }
        }
      })

      // Recalcular total da venda
      const saleItems = await tx.saleItem.findMany({
        where: { saleId: saleId }
      })

      const subtotal = saleItems.reduce((sum: number, item: { total: any }) => sum + Number(item.total), 0)
      const saleTotal = subtotal - Number(sale.discount || 0) + Number(sale.tax || 0)

      // Atualizar total da venda
      await tx.sale.update({
        where: { id: saleId },
        data: { total: saleTotal }
      })

      return newItem
    })

    console.log(`✅ [${user.role}] ${user.email} adicionou item à venda ID: ${saleId}`)

    return NextResponse.json(saleItem, { status: 201 })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
