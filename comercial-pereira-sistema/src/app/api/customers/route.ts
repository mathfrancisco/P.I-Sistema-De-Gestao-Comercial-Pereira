import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { 
  customerSearchSchema, 
  createCustomerSchema,
  cleanDocument,
  formatCPF,
  formatCNPJ 
} from "@/lib/validations/customer"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação (todos podem listar clientes)
    const user = await getAuthenticatedUser()
    
    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Validar parâmetros
    const {
      search,
      type,
      city,
      state,
      isActive,
      hasEmail,
      hasDocument,
      hasPurchases,
      page,
      limit,
      sortBy,
      sortOrder
    } = customerSearchSchema.parse(params)

    // Construir filtros do Prisma
    const where: Prisma.CustomerWhereInput = {
      // Filtro de status ativo (padrão: apenas ativos)
      isActive: isActive ?? true,
      
      // Filtro por tipo
      ...(type && { type }),
      
      // Filtros de localização
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { equals: state, mode: 'insensitive' } }),
      
      // Filtros condicionais
      ...(hasEmail !== undefined && {
        email: hasEmail ? { not: null } : null
      }),
      ...(hasDocument !== undefined && {
        document: hasDocument ? { not: null } : null
      }),
      
      // Busca textual
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { document: { contains: cleanDocument(search) } },
          { phone: { contains: search } }
        ]
      })
    }

    // Filtro para clientes com compras (requires join)
    if (hasPurchases !== undefined) {
      if (hasPurchases) {
        where.sales = { some: {} }
      } else {
        where.sales = { none: {} }
      }
    }

    // Configurar ordenação
    let orderBy: Prisma.CustomerOrderByWithRelationInput = {}
    
    if (sortBy === 'lastPurchase') {
      orderBy = {
        sales: {
          _count: sortOrder
        }
      }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Buscar clientes e total
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { sales: true }
          },
          // Para admins/managers, incluir estatísticas básicas
          ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
            sales: {
              where: { status: 'COMPLETED' },
              select: {
                total: true,
                saleDate: true
              },
              orderBy: { saleDate: 'desc' },
              take: 1 // Última compra
            }
          })
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.customer.count({ where })
    ])

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Formatar clientes para resposta
    const formattedCustomers = customers.map(customer => {
      const lastSale = customer.sales?.[0]
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document ? 
          customer.document.length === 11 ? formatCPF(customer.document) : formatCNPJ(customer.document)
          : null,
        type: customer.type,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        neighborhood: customer.neighborhood,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        salesCount: customer._count.sales,
        // Incluir dados de vendas para admins/managers
        ...(lastSale && {
          lastPurchase: {
            date: lastSale.saleDate,
            amount: lastSale.total
          }
        })
      }
    })

    console.log(`✅ [${user.role}] ${user.email} listou ${customers.length} clientes`)

    return NextResponse.json({
      customers: formattedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        type,
        city,
        state,
        isActive,
        hasEmail,
        hasDocument,
        hasPurchases
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permissões (SALESPERSON, MANAGER e ADMIN podem criar clientes)
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER', 'SALESPERSON'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para criar clientes' },
        { status: 403 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    // Verificar se email já existe (se fornecido)
    if (validatedData.email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { email: validatedData.email }
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email já está sendo usado por outro cliente', email: validatedData.email },
          { status: 409 }
        )
      }
    }

    // Verificar se documento já existe (se fornecido)
    if (validatedData.document) {
      const existingDocument = await prisma.customer.findUnique({
        where: { document: validatedData.document }
      })

      if (existingDocument) {
        return NextResponse.json(
          { 
            error: 'Documento já está sendo usado por outro cliente', 
            document: validatedData.document.length === 11 ? 
              formatCPF(validatedData.document) : 
              formatCNPJ(validatedData.document)
          },
          { status: 409 }
        )
      }
    }

    // Criar cliente
    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        document: validatedData.document,
        type: validatedData.type,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        neighborhood: validatedData.neighborhood,
        isActive: validatedData.isActive
      },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    })

    console.log(`✅ [${user.role}] ${user.email} criou cliente: ${customer.name} (${customer.type})`)

    // Formatar resposta
    const formattedCustomer = {
      ...customer,
      document: customer.document ? 
        customer.document.length === 11 ? formatCPF(customer.document) : formatCNPJ(customer.document)
        : null,
      salesCount: customer._count.sales
    }

    return NextResponse.json(formattedCustomer, { status: 201 })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
