import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { handleApiError } from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER')

        const stats = await InventoryService.getStatistics()

        return NextResponse.json({ data: stats, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
