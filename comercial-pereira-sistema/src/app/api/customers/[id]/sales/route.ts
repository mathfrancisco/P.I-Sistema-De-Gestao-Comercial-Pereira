import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { z } from "zod"

interface RouteParams {
  params: {
    id: string
  }
}

// Schema para filtros de vendas do cliente
const customerSalesSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minTotal: z.coerce.number().positive().optional(),
  maxTotal: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['saleDate', 'total', 'status']).default('saleDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeItems: z.coerce.boolean().default(false)
})

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const customerId = parseInt(params.id)
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    // Verificar se cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, type: true, isActive: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params_obj = Object.fromEntries(searchParams)
    
    // Validar parâmetros
    const {
      status,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      page,
      limit,
      sortBy,
      sortOrder,
      includeItems
    } = customerSalesSchema.parse(params_obj)

    // Construir filtros
    const where = {
      customerId: customerId,
      ...(status && { status }),
      ...(dateFrom && { saleDate: { gte: dateFrom } }),
      ...(dateTo && { saleDate: { lte: dateTo } }),
      ...(minTotal && { total: { gte: minTotal } }),
      ...(maxTotal && { total: { lte: maxTotal } })
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Buscar vendas e total
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true }
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
          }),
          _count: {
            select: { items: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit
      }),
      prisma.sale.count({ where })
    ])

    // Calcular estatísticas do período
    const periodStats = await prisma.sale.aggregate({
      where,
      _count: { id: true },
      _sum: { total: true },
      _avg: { total: true },
      _min: { total: true },
      _max: { total: true }
    })

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit)

    console.log(`✅ [${user.role}] ${user.email} consultou ${sales.length} vendas do cliente: ${customer.name}`)

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        type: customer.type,
        isActive: customer.isActive
      },
      sales: sales.map((sale: { id: any; total: any; discount: any; tax: any; status: any; notes: any; saleDate: any; createdAt: any; _count: { items: any }; user: any; items: any[] }) => ({
        id: sale.id,
        total: sale.total,
        discount: sale.discount,
        tax: sale.tax,
        status: sale.status,
        notes: sale.notes,
        saleDate: sale.saleDate,
        createdAt: sale.createdAt,
        itemCount: sale._count.items,
        user: sale.user,
        ...(includeItems && {
          items: sale.items?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            discount: item.discount,
            product: item.product
          }))
        })
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      summary: {
        totalSales: periodStats._count.id,
        totalSpent: periodStats._sum.total || 0,
        averageOrderValue: periodStats._avg.total || 0,
        minOrderValue: periodStats._min.total || 0,
        maxOrderValue: periodStats._max.total || 0
      },
      filters: {
        status,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
