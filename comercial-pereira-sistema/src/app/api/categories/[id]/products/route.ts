// app/api/categories/[id]/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { CategoryService, ApiError } from "@/lib/services/category"
import { CategoryProductFiltersInput } from "@/lib/validations/category"

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

    // Extract search parameters
    const { searchParams } = new URL(request.url)
    const params_obj = Object.fromEntries(searchParams)
    
    // Get category products using service
    const result = await CategoryService.getCategoryProducts(
      categoryId,
      params_obj as CategoryProductFiltersInput,
      user.role
    )

    console.log(`✅ [${user.role}] ${user.email} listou ${result.products.length} produtos da categoria: ${result.category.name}`)

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}