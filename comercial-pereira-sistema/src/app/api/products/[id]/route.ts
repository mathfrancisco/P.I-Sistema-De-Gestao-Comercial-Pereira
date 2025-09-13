import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { ProductService } from '@/lib/services/products'
import { productIdSchema, updateProductSchema } from '@/lib/validations/product'
import handleApiError from '@/lib/api-error'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    const { id } = productIdSchema.parse({ id: params.id })
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    
    const product = await ProductService.findById(id, includeStats)
    
    return NextResponse.json({ data: product, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER') // Apenas ADMIN e MANAGER podem atualizar
    
    const { id } = productIdSchema.parse({ id: params.id })
    const body = await request.json()
    const data = updateProductSchema.parse(body)
    
    const updatedProduct = await ProductService.update(id, data, user.id)
    
    return NextResponse.json({ 
      data: updatedProduct, 
      success: true,
      message: "Produto atualizado com sucesso"
    })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    await requireRole('ADMIN', 'MANAGER') // Apenas ADMIN e MANAGER podem excluir
    
    const { id } = productIdSchema.parse({ id: params.id })
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || undefined
    
    await ProductService.delete(id, user.id, reason)
    
    return NextResponse.json({ 
      success: true,
      message: "Produto excluído com sucesso"
    })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
