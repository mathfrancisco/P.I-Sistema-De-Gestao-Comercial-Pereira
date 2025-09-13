import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import handleApiError from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const products = await ProductService.getActiveProducts()
    
    return NextResponse.json({ data: products, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
