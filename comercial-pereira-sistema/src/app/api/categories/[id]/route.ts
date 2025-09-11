import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { updateCategorySchema, isValidCnae, VALID_CNAES } from "@/lib/validations/category"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()
    
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID da categoria inválido' },
        { status: 400 }
      )
    }

    // Buscar categoria
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { 
            products: {
              where: { isActive: true }
            }
          }
        },
        // Para admins e managers, incluir estatísticas detalhadas
        ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
          products: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              code: true,
              createdAt: true,
              inventory: {
                select: {
                  quantity: true,
                  minStock: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Top 10 produtos mais recentes
          }
        })
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Calcular estatísticas se for admin/manager
    let statistics = null
    if (['ADMIN', 'MANAGER'].includes(user.role) && category.products) {
      const products = category.products
      statistics = {
        totalProducts: products.length,
        totalValue: products.reduce((sum: number, p: { price: any }) => sum + Number(p.price), 0),
        averagePrice: products.length > 0 
          ? products.reduce((sum: number, p: { price: any }) => sum + Number(p.price), 0) / products.length
          : 0,
        lowStockProducts: products.filter((p: { inventory: { quantity: number; minStock: number } }) =>
          p.inventory && p.inventory.quantity <= p.inventory.minStock
        ).length,
        totalInventoryValue: products.reduce((sum: number, p: { price: any; inventory: { quantity: any } }) =>
          sum + (Number(p.price) * (p.inventory?.quantity || 0)), 0
        )
      }
    }

    console.log(`✅ [${user.role}] ${user.email} consultou categoria: ${category.name}`)

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      cnae: category.cnae,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category._count.products,
      ...(statistics && { statistics }),
      ...(category.products && { recentProducts: category.products })
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permissões (ADMIN e MANAGER podem editar)
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para editar categorias' },
        { status: 403 }
      )
    }

    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID da categoria inválido' },
        { status: 400 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = updateCategorySchema.parse({ ...body, id: categoryId })

    // Verificar se categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se nome já existe (se está sendo alterado)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: { 
          name: {
            equals: validatedData.name,
            mode: 'insensitive'
          },
          id: { not: categoryId }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Categoria com este nome já existe', name: validatedData.name },
          { status: 409 }
        )
      }
    }

    // Validar CNAE se está sendo alterado
    if (validatedData.cnae && validatedData.cnae !== existingCategory.cnae) {
      if (!isValidCnae(validatedData.cnae)) {
        return NextResponse.json(
          { 
            error: 'CNAE inválido para a Comercial Pereira',
            validCnaes: VALID_CNAES,
            provided: validatedData.cnae
          },
          { status: 400 }
        )
      }

      // Verificar se CNAE já está em uso
      const cnaeExists = await prisma.category.findFirst({
        where: { 
          cnae: validatedData.cnae,
          id: { not: categoryId }
        }
      })

      if (cnaeExists) {
        return NextResponse.json(
          { error: 'CNAE já está sendo usado por outra categoria', cnae: validatedData.cnae },
          { status: 409 }
        )
      }
    }

    // Verificar se tentativa de desativar categoria com produtos ativos
    if (validatedData.isActive === false && existingCategory._count.products > 0) {
      const activeProducts = await prisma.product.count({
        where: { 
          categoryId: categoryId,
          isActive: true
        }
      })

      if (activeProducts > 0) {
        return NextResponse.json(
          { 
            error: 'Não é possível desativar categoria que possui produtos ativos',
            activeProducts,
            suggestion: 'Desative ou mova os produtos antes de desativar a categoria'
          },
          { status: 409 }
        )
      }
    }

    // Atualizar categoria
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.cnae !== undefined && { cnae: validatedData.cnae }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    console.log(`✅ [${user.role}] ${user.email} atualizou categoria: ${updatedCategory.name}`)

    return NextResponse.json({
      ...updatedCategory,
      productCount: updatedCategory._count.products
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permissões (apenas ADMIN pode deletar)
    const user = await getAuthenticatedUser()
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem deletar categorias' },
        { status: 403 }
      )
    }

    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID da categoria inválido' },
        { status: 400 }
      )
    }

    // Verificar se categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se categoria possui produtos
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar categoria que possui produtos',
          productCount: existingCategory._count.products,
          suggestion: 'Mova todos os produtos para outra categoria ou desative a categoria'
        },
        { status: 409 }
      )
    }

    // Deletar categoria (hard delete apenas se não tem produtos)
    await prisma.category.delete({
      where: { id: categoryId }
    })

    console.log(`✅ [${user.role}] ${user.email} deletou categoria: ${existingCategory.name}`)

    return NextResponse.json({
      message: 'Categoria deletada com sucesso',
      deletedCategory: {
        id: existingCategory.id,
        name: existingCategory.name
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
