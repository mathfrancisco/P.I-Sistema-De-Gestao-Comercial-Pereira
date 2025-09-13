import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { productSearchSchema } from '@/lib/validations/product'
import handleApiError from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const searchData = productSearchSchema.parse(params)
    
    const products = await ProductService.search(searchData)
    
    return NextResponse.json({ data: products, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}