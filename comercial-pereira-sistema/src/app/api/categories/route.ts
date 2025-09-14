// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { CategoryService, ApiError } from "@/lib/services/category"
import { VALID_CNAES } from "@/lib/validations/category"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (everyone can list categories)
    const user = await getAuthenticatedUser()
    
    // Extract search parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Get categories using service
    const result = await CategoryService.findMany(params, user.role)

    console.log(`✅ [${user.role}] ${user.email} listou ${result.categories.length} categorias`)

    return NextResponse.json({
      categories: result.categories,
      total: result.total,
      filters: result.filters
    })

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify permissions (only ADMIN can create categories)
    const user = await getAuthenticatedUser()
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar categorias' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    
    // Create category using service
    const category = await CategoryService.create(body)

    console.log(`✅ [${user.role}] ${user.email} criou categoria: ${category.name}${category.cnae ? ` (${category.cnae})` : ''}`)

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific business errors
      if (error.statusCode === 409) {
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