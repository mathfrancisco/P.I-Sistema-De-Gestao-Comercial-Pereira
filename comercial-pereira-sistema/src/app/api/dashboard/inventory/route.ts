import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLowStockAnalysis } from '@/lib/services/dashboard'
import { inventoryAnalysisSchema } from '@/lib/validations/dashboard'

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação e permissões
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Validar parâmetros
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())
        const validatedParams = inventoryAnalysisSchema.parse(params)

        // Buscar análise de estoque
        const inventoryAlerts = await getLowStockAnalysis(
            validatedParams.urgencyLevel === 'ALL' ? undefined : validatedParams.urgencyLevel,
            validatedParams.categoryId,
            validatedParams.limit
        )

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: inventoryAlerts,
            metadata: {
                generatedAt: new Date(),
                filters: validatedParams,
                performance: {
                    queryTime,
                    cached: false
                }
            }
        })

    } catch (error) {
        console.error('Erro na análise de estoque:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}