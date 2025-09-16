import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import handleApiError from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'
import { inventoryIdSchema, updateInventorySchema } from '@/lib/validations/inventory'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthenticatedUser()
        await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')

        const validatedParams = inventoryIdSchema.parse({ id: params.id })
        const inventory = await InventoryService.findById(validatedParams.id as number)

        return NextResponse.json({ data: inventory, success: true })

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
        await requireRole('ADMIN', 'MANAGER')

        const validatedParams = inventoryIdSchema.parse({ id: params.id })
        const body = await request.json()
        const data = updateInventorySchema.parse(body)

        const updatedInventory = await InventoryService.update(
            validatedParams.id as number,
            data,
            Number(user.id)
        )

        return NextResponse.json({ data: updatedInventory, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}