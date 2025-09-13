import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireRole } from '@/lib/api-auth'
import handleApiError from '@/lib/api-error'
import { InventoryService } from '@/lib/services/inventory'
import { inventoryFiltersSchema } from '@/lib/validations/inventory'

export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação
        const user = await getAuthenticatedUser()

        // 2. Autorização - Todos os perfis podem consultar
        await requireRole('ADMIN', 'MANAGER', 'SALESPERSON')

        // 3. Validação de parâmetros
        const { searchParams } = new URL(request.url)
        const params = Object.fromEntries(searchParams.entries())
        const filters = inventoryFiltersSchema.parse(params)

        // 4. Lógica de negócio
        const result = await InventoryService.findMany(filters)

        // 5. Resposta padronizada
        return NextResponse.json({ data: result, success: true })

    } catch (error) {
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
