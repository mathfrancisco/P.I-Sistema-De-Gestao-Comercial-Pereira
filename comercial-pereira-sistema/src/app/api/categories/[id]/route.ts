// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { CategoryService, ApiError } from "@/lib/services/category"
import { VALID_CNAES } from "@/lib/validations/category"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser()
    
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID da categoria inválido' },
        { status: 400 }
      )
    }

    // Get category with details using service
    const category = await CategoryService.findByIdWithDetails(categoryId, user.role)

    console.log(`✅ [${user.role}] ${user.email} consultou categoria: ${category.name}`)

    return NextResponse.json(category)

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify permissions (ADMIN and MANAGER can edit)
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

    // Get request body
    const body = await request.json()
    
    // Update category using service
    const updatedCategory = await CategoryService.update(categoryId, body)

    console.log(`✅ [${user.role}] ${user.email} atualizou categoria: ${updatedCategory.name}`)

    return NextResponse.json(updatedCategory)

  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific business errors
      if (error.statusCode === 409) {
        if (error.message.includes('produtos ativos')) {
          // Extract product count if available
          const activeProducts = (error as any).activeProducts || 'alguns'
          return NextResponse.json(
            { 
              error: error.message,
              activeProducts,
              suggestion: 'Desative ou mova os produtos antes de desativar a categoria'
            },
            { status: 409 }
          )
        }
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.statusCode === 400 && error.message.includes('CNAE')) {
        return NextResponse.json(
          { 
            error: error.message,
            validCnaes: VALID_CNAES
          },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify permissions (only ADMIN can delete)
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

    // Delete category using service
    const result = await CategoryService.delete(categoryId)

    console.log(`✅ [${user.role}] ${user.email} deletou categoria: ${result.deletedCategory.name}`)

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific business errors
      if (error.statusCode === 409) {
        return NextResponse.json(
          { 
            error: error.message,
            suggestion: 'Mova todos os produtos para outra categoria ou desative a categoria'
          },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}