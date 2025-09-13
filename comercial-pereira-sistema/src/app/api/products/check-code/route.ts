import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { checkCodeSchema } from '@/lib/validations/product'
import handleApiError from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const body = await request.json()
    const data = checkCodeSchema.parse(body)
    
    const result = await ProductService.checkCodeAvailability(data)
    
    return NextResponse.json({ data: result, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}