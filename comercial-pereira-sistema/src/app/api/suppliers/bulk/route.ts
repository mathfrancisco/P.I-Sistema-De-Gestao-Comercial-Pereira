import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService, ApiError } from '@/lib/services/suppliers'
import { createSupplierSchema } from '@/lib/validations/suppliers'
import { z } from 'zod'

const bulkCreateSchema = z.object({
    suppliers: z.array(createSupplierSchema).min(1).max(50) // Máximo 50 fornecedores por vez
})

// POST /api/suppliers/bulk - Criar múltiplos fornecedores (ADMIN e MANAGER)
export async function POST(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Extrair e validar dados do corpo da requisição
        const body = await request.json()
        const { suppliers } = bulkCreateSchema.parse(body)

        // 3. Criar fornecedores em paralelo
        const results = await Promise.allSettled(
            suppliers.map(supplierData =>
                SupplierService.create(supplierData, parseInt(currentUser.id))
            )
        )

        // 4. Separar sucessos e falhas
        const successes = results
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as PromiseFulfilledResult<any>).value)

        const failures = results
            .filter(result => result.status === 'rejected')
            .map((result, index) => ({
                index,
                supplierName: suppliers[index].name,
                error: (result as PromiseRejectedResult).reason.message
            }))

        // 5. Resposta com resultados
        return NextResponse.json({
            success: true,
            data: {
                created: successes,
                failures: failures,
                summary: {
                    total: suppliers.length,
                    successful: successes.length,
                    failed: failures.length
                }
            },
            message: `${successes.length} fornecedores criados com sucesso. ${failures.length} falharam.`
        }, { status: failures.length > 0 ? 207 : 201 }) // 207 Multi-Status se houver falhas

    } catch (error) {
        console.error('❌ POST /api/suppliers/bulk error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}