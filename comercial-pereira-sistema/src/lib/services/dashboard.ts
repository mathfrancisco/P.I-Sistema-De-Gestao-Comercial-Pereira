// lib/services/dashboard.ts
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'
import {
    DashboardOverview,
    ProductSaleMetric,
    UserSalesMetric,
    CategorySalesMetric,
    CustomerMetric,
    InventoryAlert,
    SalesChartData,
    CategoryChartData,
    PeriodDates
} from '@/types/dashboard'
import { getPeriodDates, calculateGrowth } from '@/lib/validations/dashboard'

// =================== HELPER FUNCTIONS ===================

// Helper para converter valores para Decimal
function toDecimal(value: number | Decimal | null): Decimal {
    if (value === null || value === undefined) return new Decimal(0)
    if (value instanceof Decimal) return value
    return new Decimal(value)
}

// Helper para converter Decimal para number quando necessário
function toNumber(value: number | Decimal | null): number {
    if (value === null || value === undefined) return 0
    if (value instanceof Decimal) return value.toNumber()
    return value
}

// =================== DASHBOARD OVERVIEW ===================

export async function getDashboardOverview(
    period: string,
    dateFrom?: Date,
    dateTo?: Date,
    userId?: number,
    includeComparison = true
): Promise<DashboardOverview> {
    const periodDates = getPeriodDates(period, dateFrom, dateTo)

    // Queries paralelas para performance
    const [
        todayStats,
        monthStats,
        yearStats,
        productStats,
        customerStats,
        topProducts,
        topCustomers,
        salesByUser,
        salesByCategory
    ] = await Promise.all([
        // Vendas de hoje
        getSalesMetrics('today', undefined, undefined, userId),

        // Vendas do mês
        getSalesMetrics('month', undefined, undefined, userId),

        // Vendas do ano
        getSalesMetrics('year', undefined, undefined, userId),

        // Métricas de produtos
        getProductMetrics(),

        // Métricas de clientes
        getCustomerMetrics(periodDates),

        // Top produtos vendidos hoje
        getTopSellingProducts('today', 5),

        // Top clientes
        getTopCustomers(periodDates, 5),

        // Performance por vendedor
        getUserPerformanceMetrics(period, dateFrom, dateTo),

        // Faturamento por categoria
        getCategorySalesMetrics(period, dateFrom, dateTo)
    ])

    return {
        salesMetrics: {
            today: todayStats,
            month: monthStats,
            year: yearStats
        },
        productMetrics: {
            totalProducts: productStats.totalProducts,
            lowStockCount: productStats.lowStockCount,
            outOfStockCount: productStats.outOfStockCount,
            topSellingToday: topProducts
        },
        customerMetrics: {
            totalCustomers: customerStats.totalCustomers,
            newCustomersThisMonth: customerStats.newCustomersThisMonth,
            topCustomers: topCustomers
        },
        performanceMetrics: {
            salesByUser: salesByUser,
            salesByCategory: salesByCategory,
            conversionRate: await getConversionRate(periodDates)
        }
    }
}

// =================== MÉTRICAS DE VENDAS ===================

async function getSalesMetrics(
    period: string,
    dateFrom?: Date,
    dateTo?: Date,
    userId?: number
) {
    const periodDates = getPeriodDates(period, dateFrom, dateTo)

    const [currentStats, previousStats] = await Promise.all([
        // Período atual
        prisma.sale.aggregate({
            where: {
                status: 'COMPLETED',
                saleDate: {
                    gte: periodDates.dateFrom,
                    lt: periodDates.dateTo
                },
                ...(userId && { userId })
            },
            _count: { id: true },
            _sum: { total: true },
            _avg: { total: true }
        }),

        // Período anterior para comparação
        prisma.sale.aggregate({
            where: {
                status: 'COMPLETED',
                saleDate: {
                    gte: periodDates.compareFrom,
                    lt: periodDates.compareTo
                },
                ...(userId && { userId })
            },
            _count: { id: true },
            _sum: { total: true },
            _avg: { total: true }
        })
    ])

    return {
        count: currentStats._count.id,
        total: toDecimal(currentStats._sum.total), // Garantir que é Decimal
        average: toDecimal(currentStats._avg.total), // Garantir que é Decimal
        growth: calculateGrowth(
            toNumber(currentStats._sum.total),
            toNumber(previousStats._sum.total)
        )
    }
}

// =================== TOP PRODUTOS VENDIDOS ===================

export async function getTopSellingProducts(
    period: string,
    limit = 10,
    categoryId?: number,
    dateFrom?: Date,
    dateTo?: Date
): Promise<ProductSaleMetric[]> {
    const periodDates = getPeriodDates(period, dateFrom, dateTo)

    // Query principal com agregações
    const topProducts = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
            sale: {
                status: 'COMPLETED',
                saleDate: {
                    gte: periodDates.dateFrom,
                    lte: periodDates.dateTo
                }
            },
            ...(categoryId && {
                product: {
                    categoryId
                }
            })
        },
        _sum: {
            quantity: true,
            total: true
        },
        _count: {
            saleId: true
        },
        _avg: {
            quantity: true
        },
        orderBy: {
            _sum: {
                total: 'desc'
            }
        },
        take: limit
    })

    if (topProducts.length === 0) return []

    // Buscar dados detalhados dos produtos
    const productIds = topProducts.map((p: { productId: any }) => p.productId)
    const productsDetails = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
            category: {
                select: { name: true }
            }
        }
    })

    // Buscar última venda de cada produto
    const lastSales = await Promise.all(
        productIds.map(async (productId: any) => {
            const lastSale = await prisma.saleItem.findFirst({
                where: { productId },
                include: { sale: { select: { saleDate: true } } },
                orderBy: { sale: { saleDate: 'desc' } }
            })
            return { productId, lastSaleDate: lastSale?.sale.saleDate || null }
        })
    )

    // Combinar dados
    return topProducts.map((item: { productId: any; _sum: { quantity: any; total: number | Decimal | null }; _count: { saleId: any }; _avg: { quantity: any } }) => {
        const product = productsDetails.find((p: { id: any }) => p.id === item.productId)
        const lastSale = lastSales.find((ls: { productId: any }) => ls.productId === item.productId)

        return {
            productId: item.productId,
            productName: product?.name || 'Produto não encontrado',
            productCode: product?.code || '',
            categoryName: product?.category.name || '',
            totalQuantitySold: item._sum.quantity || 0,
            totalRevenue: toDecimal(item._sum.total), // Garantir que é Decimal
            salesCount: item._count.saleId,
            averageQuantityPerSale: Number(item._avg.quantity || 0),
            lastSaleDate: lastSale?.lastSaleDate || null,
            trend: 'STABLE' as const // TODO: Implementar cálculo de tendência
        }
    })
}

// =================== PERFORMANCE POR VENDEDOR ===================

export async function getUserPerformanceMetrics(
    period: string,
    dateFrom?: Date,
    dateTo?: Date,
    userId?: number
): Promise<UserSalesMetric[]> {
    const periodDates = getPeriodDates(period, dateFrom, dateTo)

    // Query principal com agregações
    const userPerformance = await prisma.sale.groupBy({
        by: ['userId'],
        where: {
            status: 'COMPLETED',
            saleDate: {
                gte: periodDates.dateFrom,
                lte: periodDates.dateTo
            },
            ...(userId && { userId })
        },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
        orderBy: {
            _sum: {
                total: 'desc'
            }
        }
    })

    if (userPerformance.length === 0) return []

    // Buscar dados dos usuários
    const userIds = userPerformance.map((p: { userId: any }) => p.userId)
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, role: true }
    })

    // Buscar categoria mais vendida por cada vendedor
    const topCategoriesByUser = await Promise.all(
        userIds.map(async (userId: any) => {
            const topCategory = await prisma.saleItem.groupBy({
                by: ['productId'],
                where: {
                    sale: {
                        userId,
                        status: 'COMPLETED',
                        saleDate: {
                            gte: periodDates.dateFrom,
                            lte: periodDates.dateTo
                        }
                    }
                },
                _sum: { total: true },
                orderBy: { _sum: { total: 'desc' } },
                take: 1
            })

            if (topCategory.length > 0) {
                const product = await prisma.product.findUnique({
                    where: { id: topCategory[0].productId },
                    include: { category: true }
                })
                return { userId, categoryName: product?.category.name || 'N/A' }
            }
            return { userId, categoryName: 'N/A' }
        })
    )

    // Combinar todos os dados
    return userPerformance.map((performance: { userId: any; _count: { id: number }; _sum: { total: number | Decimal | null }; _avg: { total: number | Decimal | null } }) => {
        const user = users.find((u: { id: any }) => u.id === performance.userId)
        const topCategory = topCategoriesByUser.find((tc: { userId: any }) => tc.userId === performance.userId)

        // Calcular eficiência (vendas por dia no período)
        const daysInPeriod = Math.ceil(
            (periodDates.dateTo.getTime() - periodDates.dateFrom.getTime()) / (1000 * 60 * 60 * 24)
        )
        const efficiency = performance._count.id / daysInPeriod

        return {
            userId: performance.userId,
            userName: user?.name || 'Usuário não encontrado',
            userRole: user?.role || 'N/A',
            salesCount: performance._count.id,
            totalRevenue: toDecimal(performance._sum.total), // Garantir que é Decimal
            averageOrderValue: toDecimal(performance._avg.total), // Garantir que é Decimal
            topCategory: topCategory?.categoryName || 'N/A',
            efficiency: Number(efficiency.toFixed(2)),
            growth: 0 // TODO: Implementar cálculo de crescimento
        }
    })
}

// =================== FATURAMENTO POR CATEGORIA ===================

export async function getCategorySalesMetrics(
    period: string,
    dateFrom?: Date,
    dateTo?: Date,
    categoryId?: number
): Promise<CategorySalesMetric[]> {
    const periodDates = getPeriodDates(period, dateFrom, dateTo)

    // Buscar total geral para calcular market share
    const totalRevenue = await prisma.sale.aggregate({
        where: {
            status: 'COMPLETED',
            saleDate: {
                gte: periodDates.dateFrom,
                lte: periodDates.dateTo
            }
        },
        _sum: { total: true }
    })

    // Query principal com produtos e categorias
    const categorySales = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
            sale: {
                status: 'COMPLETED',
                saleDate: {
                    gte: periodDates.dateFrom,
                    lte: periodDates.dateTo
                }
            }
        },
        _sum: {
            quantity: true,
            total: true
        },
        _count: { saleId: true }
    })

    if (categorySales.length === 0) return []

    // Buscar produtos com categorias
    const productIds = categorySales.map((cs: { productId: any }) => cs.productId)
    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds },
            ...(categoryId && { categoryId })
        },
        include: { category: true }
    })

    // Agregar por categoria
    const categoryMetrics = new Map<number, {
        categoryId: number
        categoryName: string
        cnae?: string
        salesCount: number
        totalRevenue: number
        totalQuantitySold: number
    }>()

    categorySales.forEach((sale: { productId: any; _count: { saleId: number }; _sum: { total: number | Decimal | null; quantity: any } }) => {
        const product = products.find((p: { id: any }) => p.id === sale.productId)
        if (product) {
            const categoryId = product.categoryId
            const existing = categoryMetrics.get(categoryId) || {
                categoryId,
                categoryName: product.category.name,
                cnae: product.category.cnae || undefined,
                salesCount: 0,
                totalRevenue: 0,
                totalQuantitySold: 0
            }

            existing.salesCount += sale._count.saleId
            existing.totalRevenue += toNumber(sale._sum.total) // Somar como numbers
            existing.totalQuantitySold += sale._sum.quantity || 0

            categoryMetrics.set(categoryId, existing)
        }
    })

    // Calcular market share e ordenar
    const totalRevenueAmount = toNumber(totalRevenue._sum.total)

    return Array.from(categoryMetrics.values())
        .map(category => ({
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            cnae: category.cnae,
            salesCount: category.salesCount,
            totalRevenue: toDecimal(category.totalRevenue), // Converter para Decimal
            totalQuantitySold: category.totalQuantitySold,
            averageOrderValue: toDecimal(category.salesCount > 0 
                ? category.totalRevenue / category.salesCount 
                : 0), // Garantir que é Decimal
            marketShare: totalRevenueAmount > 0
                ? (category.totalRevenue / totalRevenueAmount) * 100
                : 0,
            growth: 0, // TODO: Implementar cálculo de crescimento
            topProducts: [] // TODO: Buscar top produtos da categoria
        }))
        .sort((a, b) => toNumber(b.totalRevenue) - toNumber(a.totalRevenue))
}

// =================== ANÁLISE DE ESTOQUE ===================

export async function getLowStockAnalysis(
    urgencyLevel?: string,
    categoryId?: number,
    limit = 20
): Promise<InventoryAlert[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Produtos com estoque baixo ou zerado
    const lowStockProducts = await prisma.inventory.findMany({
        where: {
            OR: [
                { quantity: { lte: prisma.inventory.fields.minStock } },
                { quantity: { equals: 0 } }
            ],
            ...(categoryId && {
                product: { categoryId }
            })
        },
        include: {
            product: {
                include: {
                    category: { select: { name: true } },
                    saleItems: {
                        where: {
                            sale: {
                                status: 'COMPLETED',
                                saleDate: { gte: thirtyDaysAgo }
                            }
                        },
                        select: {
                            quantity: true,
                            sale: { select: { saleDate: true } }
                        }
                    }
                }
            }
        },
        take: limit
    })

    // Calcular velocidade de vendas e urgência
    const alerts = lowStockProducts.map((inventory: { product: { saleItems: any[]; id: any; name: any; code: any; category: { name: any } }; quantity: number; minStock: any; maxStock: any }) => {
        const salesLast30Days = inventory.product.saleItems.reduce(
            (total, item) => total + item.quantity, 0
        )
        const averageDailySales = salesLast30Days / 30
        const daysUntilOutOfStock = averageDailySales > 0
            ? Math.floor(inventory.quantity / averageDailySales)
            : 999

        let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
        if (daysUntilOutOfStock <= 7 || inventory.quantity === 0) {
            urgency = 'CRITICAL'
        } else if (daysUntilOutOfStock <= 15) {
            urgency = 'HIGH'
        } else {
            urgency = 'MEDIUM'
        }

        return {
            productId: inventory.product.id,
            productName: inventory.product.name,
            productCode: inventory.product.code,
            categoryName: inventory.product.category.name,
            currentStock: inventory.quantity,
            minStock: inventory.minStock,
            maxStock: inventory.maxStock || 0, // Garantir que não é null
            salesLast30Days,
            averageDailySales: Number(averageDailySales.toFixed(2)),
            daysUntilOutOfStock,
            urgencyLevel: urgency,
            isOutOfStock: inventory.quantity === 0
        }
    })

    // Filtrar por nível de urgência se especificado
    const filtered = urgencyLevel && urgencyLevel !== 'ALL'
        ? alerts.filter((alert: { urgencyLevel: string }) => alert.urgencyLevel === urgencyLevel)
        : alerts

    return filtered.sort((a: { daysUntilOutOfStock: number }, b: { daysUntilOutOfStock: number }) => a.daysUntilOutOfStock - b.daysUntilOutOfStock)
}

// =================== FUNÇÕES AUXILIARES ===================

async function getProductMetrics() {
    const [totalProducts, lowStockCount, outOfStockCount] = await Promise.all([
        prisma.product.count({
            where: { isActive: true }
        }),

        prisma.inventory.count({
            where: {
                quantity: { lte: prisma.inventory.fields.minStock }
            }
        }),

        prisma.inventory.count({
            where: { quantity: 0 }
        })
    ])

    return { totalProducts, lowStockCount, outOfStockCount }
}

async function getCustomerMetrics(periodDates: PeriodDates) {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const [totalCustomers, newCustomersThisMonth] = await Promise.all([
        prisma.customer.count({
            where: { isActive: true }
        }),

        prisma.customer.count({
            where: {
                createdAt: { gte: firstDayOfMonth }
            }
        })
    ])

    return { totalCustomers, newCustomersThisMonth }
}

async function getTopCustomers(periodDates: PeriodDates, limit = 5): Promise<CustomerMetric[]> {
    const topCustomers = await prisma.sale.groupBy({
        by: ['customerId'],
        where: {
            status: 'COMPLETED',
            saleDate: {
                gte: periodDates.dateFrom,
                lte: periodDates.dateTo
            }
        },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
        orderBy: {
            _sum: { total: 'desc' }
        },
        take: limit
    })

    if (topCustomers.length === 0) return []

    const customerIds = topCustomers.map((tc: { customerId: any }) => tc.customerId)
    const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } }
    })

    // Calcular última compra
    const lastPurchases = await Promise.all(
        customerIds.map(async (customerId: any) => {
            const lastSale = await prisma.sale.findFirst({
                where: { customerId, status: 'COMPLETED' },
                orderBy: { saleDate: 'desc' }
            })
            return { customerId, lastPurchaseDate: lastSale?.saleDate || null }
        })
    )

    return topCustomers.map((tc: { customerId: any; _sum: { total: number | Decimal | null }; _count: { id: any }; _avg: { total: number | Decimal | null } }) => {
        const customer = customers.find((c: { id: any }) => c.id === tc.customerId)
        const lastPurchase = lastPurchases.find((lp: { customerId: any }) => lp.customerId === tc.customerId)

        return {
            customerId: tc.customerId,
            customerName: customer?.name || 'Cliente não encontrado',
            customerType: customer?.type as 'RETAIL' | 'WHOLESALE' || 'RETAIL',
            totalPurchases: toDecimal(tc._sum.total), // Garantir que é Decimal
            purchaseCount: tc._count.id,
            averageOrderValue: toDecimal(tc._avg.total), // Garantir que é Decimal
            lastPurchaseDate: lastPurchase?.lastPurchaseDate || null,
            frequency: tc._count.id // Simplificado: número de compras no período
        }
    })
}

async function getConversionRate(periodDates: PeriodDates): Promise<number> {
    // Simplificado: calcular com base em vendas completadas vs total de vendas
    const [completedSales, totalSales] = await Promise.all([
        prisma.sale.count({
            where: {
                status: 'COMPLETED',
                saleDate: {
                    gte: periodDates.dateFrom,
                    lte: periodDates.dateTo
                }
            }
        }),

        prisma.sale.count({
            where: {
                saleDate: {
                    gte: periodDates.dateFrom,
                    lte: periodDates.dateTo
                }
            }
        })
    ])

    return totalSales > 0 ? (completedSales / totalSales) * 100 : 0
}