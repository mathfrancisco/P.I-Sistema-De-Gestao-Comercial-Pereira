import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { validateStockSchema } from "@/lib/validations/sale"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser()

    // Validar dados de entrada
    const body = await request.json()
    const { items } = validateStockSchema.parse(body)

    // Buscar produtos e seus estoques
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        isActive: true
      },
      include: {
        inventory: true
      }
    })

    // Validar cada item
    const validationResults = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      
      if (!product) {
        return {
          productId: item.productId,
          isValid: false,
          error: 'Produto não encontrado ou inativo',
          requestedQuantity: item.quantity,
          availableQuantity: 0
        }
      }

      if (!product.inventory) {
        return {
          productId: item.productId,
          productName: product.name,
          isValid: false,
          error: 'Produto sem controle de estoque',
          requestedQuantity: item.quantity,
          availableQuantity: 0
        }
      }

      const isValid = product.inventory.quantity >= item.quantity
      
      return {
        productId: item.productId,
        productName: product.name,
        productCode: product.code,
        isValid,
        requestedQuantity: item.quantity,
        availableQuantity: product.inventory.quantity,
        ...(isValid ? {} : { 
          error: 'Estoque insuficiente',
          shortfall: item.quantity - product.inventory.quantity
        })
      }
    })

    // Calcular estatísticas gerais
    const allValid = validationResults.every(result => result.isValid)
    const invalidCount = validationResults.filter(result => !result.isValid).length

    console.log(`✅ [${user.role}] ${user.email} validou estoque para ${items.length} itens`)

    return NextResponse.json({
      isValid: allValid,
      totalItems: items.length,
      validItems: items.length - invalidCount,
      invalidItems: invalidCount,
      validationResults,
      summary: {
        canProceed: allValid,
        message: allValid 
          ? 'Todos os itens têm estoque suficiente'
          : `${invalidCount} item(ns) com estoque insuficiente`
      }
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
