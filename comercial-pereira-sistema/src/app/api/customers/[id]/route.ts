import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { updateCustomerSchema, formatCPF, formatCNPJ, cleanDocument } from "@/lib/validations/customer"

interface RouteParams {
  params: {
    id: string
  }
}

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

    // Buscar cliente com estatísticas
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: { sales: true }
        },
        // Dados detalhados de vendas para análise
        sales: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            total: true,
            saleDate: true,
            items: {
              select: {
                quantity: true,
                total: true,
                product: {
                  select: {
                    name: true,
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { saleDate: 'desc' }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Calcular estatísticas
    const completedSales = customer.sales
    const totalSpent = completedSales.reduce((sum: number, sale: { total: any }) => sum + Number(sale.total), 0)
    const averageOrderValue = completedSales.length > 0 ? totalSpent / completedSales.length : 0
    
    // Primeira e última compra
    const sortedSales = [...completedSales].sort((a, b) => 
      new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
    )
    const firstPurchase = sortedSales[0]?.saleDate
    const lastPurchase = sortedSales[sortedSales.length - 1]?.saleDate

    // Categorias mais compradas
    const categoryPurchases = new Map<string, { count: number; total: number }>()
    
    completedSales.forEach((sale: { items: any[] }) => {
      sale.items.forEach(item => {
        const categoryName = item.product.category.name
        const existing = categoryPurchases.get(categoryName) || { count: 0, total: 0 }
        existing.count += item.quantity
        existing.total += Number(item.total)
        categoryPurchases.set(categoryName, existing)
      })
    })

    const favoriteCategories = Array.from(categoryPurchases.entries())
      .map(([categoryName, data]) => ({
        categoryName,
        purchaseCount: data.count,
        totalSpent: data.total
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5) // Top 5 categorias

    console.log(`✅ [${user.role}] ${user.email} consultou cliente: ${customer.name}`)

    // Formatar resposta
    const formattedCustomer = {
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
      
      // Estatísticas
      statistics: {
        totalSales: customer._count.sales,
        totalSpent,
        averageOrderValue,
        firstPurchase,
        lastPurchase,
        favoriteCategories
      },
      
      // Vendas recentes (últimas 5)
      recentSales: completedSales.slice(0, 5).map((sale: { id: any; total: any; saleDate: any; items: string | any[] }) => ({
        id: sale.id,
        total: sale.total,
        saleDate: sale.saleDate,
        itemCount: sale.items.length
      }))
    }

    return NextResponse.json(formattedCustomer)

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permissões
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER', 'SALESPERSON'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para editar clientes' },
        { status: 403 }
      )
    }

    const customerId = parseInt(params.id)
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = updateCustomerSchema.parse({ ...body, id: customerId })

    // Verificar se cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email já está sendo usado por outro cliente', email: validatedData.email },
          { status: 409 }
        )
      }
    }

    // Verificar se documento já existe (se está sendo alterado)
    if (validatedData.document && validatedData.document !== existingCustomer.document) {
      const documentExists = await prisma.customer.findUnique({
        where: { document: validatedData.document }
      })

      if (documentExists) {
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

    // Atualizar cliente
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.document !== undefined && { document: validatedData.document }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.address !== undefined && { address: validatedData.address }),
        ...(validatedData.city !== undefined && { city: validatedData.city }),
        ...(validatedData.state !== undefined && { state: validatedData.state }),
        ...(validatedData.zipCode !== undefined && { zipCode: validatedData.zipCode }),
        ...(validatedData.neighborhood !== undefined && { neighborhood: validatedData.neighborhood }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    })

    console.log(`✅ [${user.role}] ${user.email} atualizou cliente: ${updatedCustomer.name}`)

    // Formatar resposta
    const formattedCustomer = {
      ...updatedCustomer,
      document: updatedCustomer.document ? 
        updatedCustomer.document.length === 11 ? formatCPF(updatedCustomer.document) : formatCNPJ(updatedCustomer.document)
        : null,
      salesCount: updatedCustomer._count.sales
    }

    return NextResponse.json(formattedCustomer)

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permissões (apenas ADMIN e MANAGER podem desativar)
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para desativar clientes' },
        { status: 403 }
      )
    }

    const customerId = parseInt(params.id)
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    // Verificar se cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se cliente tem vendas (soft delete apenas)
    if (existingCustomer._count.sales > 0) {
      // Soft delete - apenas desativar
      const deactivatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: { isActive: false }
      })

      console.log(`✅ [${user.role}] ${user.email} desativou cliente: ${deactivatedCustomer.name}`)

      return NextResponse.json({
        message: 'Cliente desativado com sucesso (possui histórico de vendas)',
        customer: {
          id: deactivatedCustomer.id,
          name: deactivatedCustomer.name,
          isActive: deactivatedCustomer.isActive
        }
      })
    } else {
      // Hard delete se não tiver vendas
      await prisma.customer.delete({
        where: { id: customerId }
      })

      console.log(`✅ [${user.role}] ${user.email} deletou cliente: ${existingCustomer.name}`)

      return NextResponse.json({
        message: 'Cliente deletado com sucesso',
        customer: {
          id: existingCustomer.id,
          name: existingCustomer.name
        }
      })
    }

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
