import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTopSellingProducts } from '@/lib/services/dashboard'
import { topProductsSchema } from '@/lib/validations/dashboard'

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Verificar autenticação e permissões
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        if (!['ADMIN', 'MANAGER', 'SALESPERSON'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        // Validar parâmetros
        const searchParams = request.nextUrl.searchParams
        const params = Object.fromEntries(searchParams.entries())
        const validatedParams = topProductsSchema.parse(params)

        // Buscar top produtos
        const products = await getTopSellingProducts(
            validatedParams.period,
            validatedParams.limit,
            validatedParams.categoryId,
            validatedParams.dateFrom,
            validatedParams.dateTo
        )

        const queryTime = Date.now() - startTime

        return NextResponse.json({
            data: products,
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
        console.error('Erro nos produtos mais vendidos:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        )
    }
}
