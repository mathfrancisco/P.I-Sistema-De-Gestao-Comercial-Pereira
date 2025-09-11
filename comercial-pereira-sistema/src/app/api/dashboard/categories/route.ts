import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategorySalesMetrics } from '@/lib/services/dashboard'
import { categoryMetricsSchema } from '@/lib/validations/dashboard'

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
        const validatedParams = categoryMetricsSchema.parse(params)

        // Buscar métricas por categoria
        const categoryMetrics = await getCategorySalesMetrics(
            validatedParams.period,
            validatedParams.dateFrom,
            validatedParams.dateTo,
            validatedParams.categoryId
        )

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: categoryMetrics,
            metadata: {
                generatedAt: new Date(),
                period: {
                    from: validatedParams.dateFrom || new Date(),
                    to: validatedParams.dateTo || new Date(),
                    type: validatedParams.period
                },
                filters: validatedParams,
                performance: {
                    queryTime,
                    cached: false
                }
            }
        })

    } catch (error) {
        console.error('Erro nas métricas de categoria:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}