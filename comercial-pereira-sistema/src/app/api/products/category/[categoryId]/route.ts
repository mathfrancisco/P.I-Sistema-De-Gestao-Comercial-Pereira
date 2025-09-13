import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { z } from 'zod'
import handleApiError from '@/lib/api-error'

const categoryIdSchema = z.object({
  categoryId: z.coerce.number().min(1, "ID da categoria deve ser maior que 0")
})

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const { categoryId } = categoryIdSchema.parse({ categoryId: params.categoryId })
    const products = await ProductService.getProductsByCategory(categoryId)
    
    return NextResponse.json({ data: products, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}