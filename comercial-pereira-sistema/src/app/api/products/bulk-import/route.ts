import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { bulkImportSchema } from '@/lib/validations/product'
import handleApiError from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER') // Apenas ADMIN e MANAGER podem importar em lote
    
    const body = await request.json()
    const data = bulkImportSchema.parse(body)
    
    const result = await ProductService.bulkImport(data, Number(user.id))
    
    return NextResponse.json({ 
      data: result, 
      success: true,
      message: `Importação concluída: ${result.success} produtos criados, ${result.errors.length} erros`
    }, { status: 201 })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}