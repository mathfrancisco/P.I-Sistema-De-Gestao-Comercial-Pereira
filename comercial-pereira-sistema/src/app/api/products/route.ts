import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'

import { ProductService } from '@/lib/services/products'
import { productFiltersSchema, createProductSchema } from '@/lib/validations/product'
import handleApiError from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const user = await getAuthenticatedUser()
    
    // 2. Autorização - Todos os perfis podem consultar
    await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')
    
    // 3. Validação de parâmetros
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const filters = productFiltersSchema.parse(params)
    
    // 4. Lógica de negócio
    const result = await ProductService.findMany(filters)
    
    // 5. Resposta padronizada
    return NextResponse.json({ data: result, success: true })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const user = await getAuthenticatedUser()
    
    // 2. Autorização - Apenas ADMIN e MANAGER podem criar
    await requireRole('ADMIN', 'MANAGER')
    
    // 3. Validação
    const body = await request.json()
    const data = createProductSchema.parse(body)
    
    // 4. Criar produto
    const product = await ProductService.create(data, Number(user.id))
    
    // 5. Resposta
    return NextResponse.json({ 
      data: product, 
      success: true,
      message: "Produto criado com sucesso"
    }, { status: 201 })
    
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
