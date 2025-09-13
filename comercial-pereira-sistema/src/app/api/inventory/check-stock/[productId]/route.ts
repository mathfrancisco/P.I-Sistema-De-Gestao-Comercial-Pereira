import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import handleApiError from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'
import { productIdSchema } from '@/lib/validations/inventory'

export async function GET(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')

        const { productId } = productIdSchema.parse({ productId: params.productId })
        const stockInfo = await InventoryService.checkStock(productId)

        return NextResponse.json({ data: stockInfo, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}