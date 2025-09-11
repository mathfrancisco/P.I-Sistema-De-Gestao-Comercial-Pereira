import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { handleApiError } from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'
import { movementFiltersSchema, stockMovementSchema } from '@/lib/validations/inventory'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')

        const { searchParams } = new URL(request.url)
        const params = Object.fromEntries(searchParams.entries())
        const filters = movementFiltersSchema.parse(params)

        const result = await InventoryService.getMovements(filters)

        return NextResponse.json({ data: result, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER')

        const body = await request.json()
        const data = stockMovementSchema.parse(body)

        const result = await InventoryService.processStockMovement(data, user.id)

        return NextResponse.json({
            data: result,
            success: true,
            message: "Movimentação de estoque processada com sucesso"
        }, { status: 201 })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
