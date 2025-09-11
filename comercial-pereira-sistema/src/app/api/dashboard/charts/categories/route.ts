import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategorySalesMetrics } from '@/lib/services/dashboard'
import { categoryChartSchema } from '@/lib/validations/dashboard'

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Validar parâmetros
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())
        const validatedParams = categoryChartSchema.parse(params)

        // Buscar dados das categorias
        const categoryMetrics = await getCategorySalesMetrics(
            validatedParams.period,
            validatedParams.dateFrom,
            validatedParams.dateTo
        )

        // Limitar ao top N categorias
        const topCategories = categoryMetrics.slice(0, validatedParams.topN)

        // Formatar dados para o gráfico
        const chartData = topCategories.map(category => ({
            categoryName: category.categoryName,
            revenue: Number(category.totalRevenue),
            percentage: Number(category.marketShare.toFixed(2)),
            salesCount: category.salesCount
        }))

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: chartData,
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
        console.error('Erro no gráfico de categorias:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}