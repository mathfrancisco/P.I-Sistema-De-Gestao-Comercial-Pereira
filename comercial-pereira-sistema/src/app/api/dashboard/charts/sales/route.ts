import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { salesChartSchema, getPeriodDates } from '@/lib/validations/dashboard'

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
        const validatedParams = salesChartSchema.parse(params)

        const periodDates = getPeriodDates(
            validatedParams.period,
            validatedParams.dateFrom,
            validatedParams.dateTo
        )

        // Buscar dados de vendas agrupados por período
        let groupByFormat: string
        switch (validatedParams.granularity) {
            case 'day':
                groupByFormat = 'YYYY-MM-DD'
                break
            case 'week':
                groupByFormat = 'YYYY-WW'
                break
            case 'month':
                groupByFormat = 'YYYY-MM'
                break
            default:
                groupByFormat = 'YYYY-MM-DD'
        }

        // Query usando SQL raw para agrupamento por data
        const salesData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${validatedParams.granularity}, sale_date) as period,
        COUNT(*) as sales_count,
        SUM(total) as total_revenue,
        COUNT(DISTINCT id) as orders_count
      FROM sales 
      WHERE 
        status = 'COMPLETED' 
        AND sale_date >= ${periodDates.dateFrom}
        AND sale_date <= ${periodDates.dateTo}
        ${validatedParams.userId ? prisma.$queryRaw`AND user_id = ${validatedParams.userId}` : prisma.$queryRaw``}
      GROUP BY DATE_TRUNC(${validatedParams.granularity}, sale_date)
      ORDER BY period ASC
    ` as any[]

        // Formatar dados para o gráfico
        const chartData = salesData.map(row => ({
            date: row.period.toISOString().split('T')[0],
            sales: Number(row.sales_count),
            revenue: Number(row.total_revenue),
            orders: Number(row.orders_count)
        }))

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: chartData,
            metadata: {
                generatedAt: new Date(),
                period: periodDates,
                filters: validatedParams,
                performance: {
                    queryTime,
                    cached: false
                }
            }
        })

    } catch (error) {
        console.error('Erro no gráfico de vendas:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}
