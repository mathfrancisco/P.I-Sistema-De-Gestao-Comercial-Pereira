import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import { handleApiError } from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'
import { stockAdjustmentSchema } from '@/lib/validations/inventory'

export async function POST(request: NextRequest) {
    try {
        // 1. Autenticação
        const user = await getAuthenticatedUser()

        // 2. Autorização - Apenas ADMIN e MANAGER podem ajustar
        await requireRole('ADMIN', 'MANAGER')

        // 3. Validação
        const body = await request.json()
        const data = stockAdjustmentSchema.parse(body)

        // 4. Processar ajuste
        const result = await InventoryService.adjustStock(data, user.id)

        // 5. Resposta
        return NextResponse.json({
            data: result,
            success: true,
            message: "Ajuste de estoque realizado com sucesso"
        }, { status: 201 })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}