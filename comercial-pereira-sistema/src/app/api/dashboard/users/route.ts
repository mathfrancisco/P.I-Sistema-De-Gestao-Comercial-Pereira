import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPerformanceMetrics } from '@/lib/services/dashboard'
import { userPerformanceSchema } from '@/lib/validations/dashboard'

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação e permissões
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Apenas Admin e Manager podem ver performance de outros usuários
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())

        // Se não é Admin/Manager, só pode ver própria performance
        if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
            params.userId = session.user.id.toString()
        }

        const validatedParams = userPerformanceSchema.parse(params)

        // Buscar performance dos usuários
        const userMetrics = await getUserPerformanceMetrics(
            validatedParams.period,
            validatedParams.dateFrom,
            validatedParams.dateTo,
            validatedParams.userId
        )

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: userMetrics,
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
        console.error('Erro na performance de usuários:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}
