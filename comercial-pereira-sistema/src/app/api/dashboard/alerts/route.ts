import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLowStockAnalysis } from '@/lib/services/dashboard'
import { alertsSchema } from '@/lib/validations/dashboard'
import { InventoryAlert } from "@/types/dashboard"

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({error: 'Não autorizado'}, {status: 401})
        }

        // Apenas Manager e Admin podem ver alertas
        if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({error: 'Acesso negado'}, {status: 403})
        }

        // Validar parâmetros
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())
        const validatedParams = alertsSchema.parse(params)

        const alerts: { id: string; type: string; priority: string; title: string; message: string; data: InventoryAlert; createdAt: Date }[] = []

        // Alertas de estoque baixo/zerado
        if (validatedParams.types.includes('LOW_STOCK') || validatedParams.types.includes('OUT_OF_STOCK')) {
            const stockAlerts = await getLowStockAnalysis(
                validatedParams.priority === 'ALL' ? undefined : validatedParams.priority,
                undefined,
                validatedParams.limit
            )

            stockAlerts.forEach(alert => {
                if (validatedParams.types.includes('OUT_OF_STOCK') && alert.isOutOfStock) {
                    alerts.push({
                        id: `out-${alert.productId}`,
                        type: 'OUT_OF_STOCK',
                        priority: 'HIGH',
                        title: `Produto em falta: ${alert.productName}`,
                        message: `O produto ${alert.productCode} está sem estoque`,
                        data: alert,
                        createdAt: new Date()
                    })
                } else if (validatedParams.types.includes('LOW_STOCK') && !alert.isOutOfStock) {
                    alerts.push({
                        id: `low-${alert.productId}`,
                        type: 'LOW_STOCK',
                        priority: alert.urgencyLevel,
                        title: `Estoque baixo: ${alert.productName}`,
                        message: `Restam apenas ${alert.currentStock} unidades (${alert.daysUntilOutOfStock} dias)`,
                        data: alert,
                        createdAt: new Date()
                    })
                }
            })
        }

        // Ordenar por prioridade
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
        alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: alerts.slice(0, validatedParams.limit),
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
        console.error('Erro nos alertas:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}