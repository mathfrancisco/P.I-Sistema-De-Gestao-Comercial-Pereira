import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { z } from 'zod'
import handleApiError from '@/lib/api-error'

const supplierIdSchema = z.object({
  supplierId: z.coerce.number().min(1, "ID do fornecedor deve ser maior que 0")
})

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierId: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const { supplierId } = supplierIdSchema.parse({ supplierId: params.supplierId })
    const products = await ProductService.getProductsBySupplier(supplierId)
    
    return NextResponse.json({ data: products, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}