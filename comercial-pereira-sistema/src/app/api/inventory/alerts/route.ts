import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { handleApiError } from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'low-stock'

        let result
        if (type === 'out-of-stock') {
            result = await InventoryService.getOutOfStockProducts()
        } else {
            result = await InventoryService.getLowStockAlert()
        }

        return NextResponse.json({ data: result, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
