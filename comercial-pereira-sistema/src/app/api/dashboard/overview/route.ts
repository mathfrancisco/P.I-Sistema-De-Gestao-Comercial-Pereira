import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardOverview } from '@/lib/services/dashboard'
import { dashboardOverviewSchema } from '@/lib/validations/dashboard'
import { DashboardResponse } from '@/types/dashboard'

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            )
        }

        // Verificar permissões (apenas Manager e Admin podem ver dashboard)
        if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas gerentes e administradores podem visualizar o dashboard.' },
                { status: 403 }
            )
        }

        // Extrair e validar parâmetros
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())

        const validatedParams = dashboardOverviewSchema.parse(params)

        // Buscar dados do dashboard
        const overview = await getDashboardOverview(
            validatedParams.period,
            validatedParams.dateFrom,
            validatedParams.dateTo,
            validatedParams.userId,
            validatedParams.includeComparison
        )

        const queryTime = Date.now() - startTime

        // Estruturar resposta
        const response: DashboardResponse<typeof overview> = {
            data: overview,
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
                    cached: false // TODO: Implementar cache
                }
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Erro no dashboard overview:', error)

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}