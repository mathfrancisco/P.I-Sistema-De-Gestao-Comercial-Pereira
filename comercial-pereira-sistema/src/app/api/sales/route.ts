import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { 
  saleSearchSchema, 
  createSaleSchema,
  calculateItemTotal,
  calculateSubtotal,
  calculateSaleTotal
} from "@/lib/validations/sale"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Validar parâmetros
    const {
      customerId,
      userId,
      status,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      includeItems
    } = saleSearchSchema.parse(params)

    // Construir filtros do Prisma
    const where: Prisma.SaleWhereInput = {
      // Filtros básicos
      ...(customerId && { customerId }),
      ...(status && { status }),
      
      // Filtros de data
      ...(dateFrom && { saleDate: { gte: dateFrom } }),
      ...(dateTo && { saleDate: { lte: dateTo } }),
      
      // Filtros de valor
      ...(minTotal && { total: { gte: minTotal } }),
      ...(maxTotal && { total: { lte: maxTotal } }),
      
      // Busca textual
      ...(search && {
        OR: [
          { notes: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    // Filtro por usuário (vendedores só veem suas vendas)
    if (user.role === 'SALESPERSON') {
      where.userId = parseInt(user.id)
    } else if (userId) {
      where.userId = userId
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Buscar vendas e total
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, type: true }
          },
          user: {
            select: { id: true, name: true }
          },
          _count: {
            select: { items: true }
          },
          ...(includeItems && {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          })
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit
      }),
      prisma.sale.count({ where })
    ])

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit)

    console.log(`✅ [${user.role}] ${user.email} listou ${sales.length} vendas`)

    return NextResponse.json({
      sales: sales.map((sale: { id: any; customerId: any; userId: any; total: any; discount: any; tax: any; status: any; notes: any; saleDate: any; createdAt: any; updatedAt: any; customer: any; user: any; _count: { items: any }; items: any }) => ({
        id: sale.id,
        customerId: sale.customerId,
        userId: sale.userId,
        total: sale.total,
        discount: sale.discount,
        tax: sale.tax,
        status: sale.status,
        notes: sale.notes,
        saleDate: sale.saleDate,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
        customer: sale.customer,
        user: sale.user,
        itemCount: sale._count.items,
        ...(includeItems && { items: sale.items })
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        customerId,
        userId,
        status,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        search
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permissões (todos podem criar vendas)
    const user = await getAuthenticatedUser()

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = createSaleSchema.parse(body)

    // Verificar se cliente existe e está ativo
    const customer = await prisma.customer.findUnique({
      where: { id: validatedData.customerId, isActive: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado ou inativo' },
        { status: 400 }
      )
    }

    // Validar produtos e calcular preços
    const productIds = validatedData.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        isActive: true
      },
      include: {
        inventory: true
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais produtos não foram encontrados ou estão inativos' },
        { status: 400 }
      )
    }

    // Validar estoque disponível
    const stockErrors = []
    for (const item of validatedData.items) {
      const product = products.find((p: { id: number }) => p.id === item.productId)
      if (product && product.inventory && product.inventory.quantity < item.quantity) {
        stockErrors.push({
          productId: item.productId,
          productName: product.name,
          requested: item.quantity,
          available: product.inventory.quantity
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

    // Preparar itens com preços corretos
    const itemsWithPrices = validatedData.items.map(item => {
      const product = products.find((p: { id: number }) => p.id === item.productId)!
      const unitPrice = item.unitPrice || Number(product.price)
      const total = calculateItemTotal(item.quantity, unitPrice, item.discount)
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount: item.discount,
        total
      }
    })

    // Calcular totais da venda
    const subtotal = calculateSubtotal(itemsWithPrices)
    const total = calculateSaleTotal(subtotal, validatedData.discount, validatedData.tax)

    // Criar venda com transação
    const sale = await prisma.$transaction(async (tx: { sale: { create: (arg0: { data: { userId: number; customerId: number; total: number; discount: number; tax: number; status: string; notes: string | null | undefined; saleDate: Date } }) => any }; saleItem: { createMany: (arg0: { data: { productId: number; quantity: number; unitPrice: number; discount: number; total: number; saleId: any }[] }) => any } }) => {
      // Criar venda
      const newSale = await tx.sale.create({
        data: {
          userId: parseInt(user.id),
          customerId: validatedData.customerId,
          total,
          discount: validatedData.discount,
          tax: validatedData.tax,
          status: 'DRAFT',
          notes: validatedData.notes,
          saleDate: new Date()
        }
      })

      // Criar itens da venda
      await tx.saleItem.createMany({
        data: itemsWithPrices.map(item => ({
          saleId: newSale.id,
          ...item
        }))
      })

      return newSale
    })

    // Buscar venda completa para resposta
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
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

    console.log(`✅ [${user.role}] ${user.email} criou venda para cliente: ${customer.name}`)

    return NextResponse.json(completeSale, { status: 201 })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
