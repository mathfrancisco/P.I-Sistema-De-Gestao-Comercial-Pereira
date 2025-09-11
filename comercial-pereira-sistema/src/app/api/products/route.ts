import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { productSearchSchema, createProductSchema } from "@/lib/validations/product"
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
      search,
      categoryId,
      supplierId,
      minPrice,
      maxPrice,
      inStock,
      isActive,
      page,
      limit,
      sortBy,
      sortOrder
    } = productSearchSchema.parse(params)

    // Construir filtros do Prisma
    const where: Prisma.ProductWhereInput = {
      // Filtro de status ativo
      isActive: isActive ?? true,
      
      // Busca por nome, código ou descrição
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      
      // Filtros específicos
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
      
      // Filtros de preço
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      
      // Filtro de estoque
      ...(inStock !== undefined && {
        inventory: inStock 
          ? { quantity: { gt: 0 } }
          : { quantity: { lte: 0 } }
      })
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Buscar produtos e total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, description: true }
          },
          supplier: {
            select: { id: true, name: true, contactPerson: true }
          },
          inventory: {
            select: { 
              quantity: true, 
              minStock: true, 
              maxStock: true,
              location: true,
              lastUpdate: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`✅ [${user.role}] ${user.email} listou ${products.length} produtos`)

    return NextResponse.json({
      products,
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
        categoryId,
        supplierId,
        minPrice,
        maxPrice,
        inStock,
        isActive
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permissões (apenas ADMIN e MANAGER)
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para criar produtos' },
        { status: 403 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Verificar se código já existe
    const existingProduct = await prisma.product.findUnique({
      where: { code: validatedData.code }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Código de produto já existe', code: validatedData.code },
        { status: 409 }
      )
    }

    // Verificar se categoria existe
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId, isActive: true }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada ou inativa' },
        { status: 400 }
      )
    }

    // Verificar fornecedor se fornecido
    if (validatedData.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: validatedData.supplierId, isActive: true }
      })

      if (!supplier) {
        return NextResponse.json(
          { error: 'Fornecedor não encontrado ou inativo' },
          { status: 400 }
        )
      }
    }

    // Criar produto com estoque inicial
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        code: validatedData.code,
        barcode: validatedData.barcode,
        categoryId: validatedData.categoryId,
        supplierId: validatedData.supplierId,
        
        // Criar registro de estoque automaticamente
        inventory: {
          create: {
            quantity: validatedData.initialQuantity,
            minStock: validatedData.minStock,
            maxStock: validatedData.maxStock,
            location: validatedData.location
          }
        }
      },
      include: {
        category: {
          select: { id: true, name: true, description: true }
        },
        supplier: {
          select: { id: true, name: true, contactPerson: true }
        },
        inventory: true
      }
    })

    console.log(`✅ [${user.role}] ${user.email} criou produto: ${product.name} (${product.code})`)

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
