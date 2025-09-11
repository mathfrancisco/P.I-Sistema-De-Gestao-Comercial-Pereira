import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from "@/lib/api-auth"
import { categorySearchSchema, createCategorySchema, VALID_CNAES, isValidCnae } from "@/lib/validations/category"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação (todos podem listar categorias)
    const user = await getAuthenticatedUser()
    
    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Validar parâmetros
    const {
      search,
      isActive,
      hasCnae,
      sortBy,
      sortOrder,
      includeProductCount
    } = categorySearchSchema.parse(params)

    // Construir filtros do Prisma
    const where: Prisma.CategoryWhereInput = {
      // Filtro de status ativo (padrão: apenas ativas)
      isActive: isActive ?? true,
      
      // Busca por nome ou descrição
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      
      // Filtro por ter CNAE ou não
      ...(hasCnae !== undefined && {
        cnae: hasCnae ? { not: null } : null
      })
    }

    // Configurar ordenação
    let orderBy: Prisma.CategoryOrderByWithRelationInput = {}
    
    if (sortBy === 'productCount' && includeProductCount) {
      orderBy = { products: { _count: sortOrder } }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Buscar categorias
    const categories = await prisma.category.findMany({
      where,
      include: {
        // Incluir contagem de produtos se solicitado
        ...(includeProductCount && {
          _count: {
            select: { 
              products: {
                where: { isActive: true } // Apenas produtos ativos
              }
            }
          }
        }),
        // Para admins e managers, incluir alguns produtos como preview
        ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
          products: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              code: true
            },
            take: 3, // Apenas 3 produtos como preview
            orderBy: { createdAt: 'desc' }
          }
        })
      },
      orderBy
    })

    // Formatar resposta
    const formattedCategories = categories.map((category: { id: any; name: any; description: any; cnae: any; isActive: any; createdAt: any; updatedAt: any; _count: { products: any }; products: any }) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      cnae: category.cnae,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      // Incluir contagem se solicitado
      ...(includeProductCount && {
        productCount: category._count?.products || 0
      }),
      // Incluir preview de produtos para admins/managers
      ...((['ADMIN', 'MANAGER'].includes(user.role)) && {
        productsPreview: category.products || []
      })
    }))

    console.log(`✅ [${user.role}] ${user.email} listou ${categories.length} categorias`)

    return NextResponse.json({
      categories: formattedCategories,
      total: categories.length,
      filters: {
        search,
        isActive,
        hasCnae,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permissões (apenas ADMIN pode criar categorias)
    const user = await getAuthenticatedUser()
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar categorias' },
        { status: 403 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // Verificar se nome já existe
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Categoria com este nome já existe', name: validatedData.name },
        { status: 409 }
      )
    }

    // Validar CNAE se fornecido
    if (validatedData.cnae && !isValidCnae(validatedData.cnae)) {
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
    if (validatedData.cnae) {
      const existingCnae = await prisma.category.findFirst({
        where: { cnae: validatedData.cnae }
      })

      if (existingCnae) {
        return NextResponse.json(
          { error: 'CNAE já está sendo usado por outra categoria', cnae: validatedData.cnae },
          { status: 409 }
        )
      }
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        cnae: validatedData.cnae,
        isActive: validatedData.isActive
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    console.log(`✅ [${user.role}] ${user.email} criou categoria: ${category.name}${category.cnae ? ` (${category.cnae})` : ''}`)

    return NextResponse.json({
      ...category,
      productCount: category._count.products
    }, { status: 201 })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
