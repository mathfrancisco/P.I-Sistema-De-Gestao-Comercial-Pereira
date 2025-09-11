// lib/validations/dashboard.ts
import { z } from 'zod'

// =================== SCHEMAS BASE ===================

// Schema base para filtros de período
const basePeriodSchema = z.object({
    period: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    compareWith: z.enum(['previous', 'lastYear', 'none']).default('none'),
    timezone: z.string().default('America/Sao_Paulo')
})

// Validação customizada para período
const validateCustomPeriod = basePeriodSchema.refine((data) => {
    if (data.period === 'custom') {
        return data.dateFrom && data.dateTo && data.dateFrom <= data.dateTo
    }
    return true
}, {
    message: "Para período customizado, dateFrom e dateTo são obrigatórios e dateFrom deve ser <= dateTo"
})

// =================== SCHEMAS ESPECÍFICOS ===================

// Schema para dashboard overview
export const dashboardOverviewSchema = validateCustomPeriod.extend({
    includeComparison: z.coerce.boolean().default(true),
    includeGrowth: z.coerce.boolean().default(true),
    userId: z.coerce.number().optional(), // Para filtrar por vendedor específico
})

// Schema para produtos mais vendidos
export const topProductsSchema = validateCustomPeriod.extend({
    limit: z.coerce.number().min(1).max(50).default(10),
    categoryId: z.coerce.number().optional(),
    sortBy: z.enum(['revenue', 'quantity', 'salesCount']).default('revenue'),
    includeTrends: z.coerce.boolean().default(true)
})

// Schema para performance de vendedores
export const userPerformanceSchema = validateCustomPeriod.extend({
    userId: z.coerce.number().optional(),
    includeRanking: z.coerce.boolean().default(true),
    includeTopCategories: z.coerce.boolean().default(true),
    minSales: z.coerce.number().min(0).optional() // Filtrar vendedores com min X vendas
})

// Schema para métricas de categoria
export const categoryMetricsSchema = validateCustomPeriod.extend({
    categoryId: z.coerce.number().optional(),
    includeProducts: z.coerce.boolean().default(false),
    includeMarketShare: z.coerce.boolean().default(true),
    sortBy: z.enum(['revenue', 'salesCount', 'marketShare']).default('revenue')
})

// Schema para análise de estoque
export const inventoryAnalysisSchema = z.object({
    includeOutOfStock: z.coerce.boolean().default(true),
    includeLowStock: z.coerce.boolean().default(true),
    urgencyLevel: z.enum(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM']).default('ALL'),
    categoryId: z.coerce.number().optional(),
    sortBy: z.enum(['urgency', 'name', 'category', 'stock']).default('urgency'),
    limit: z.coerce.number().min(1).max(100).default(20)
})

// Schema para dados de gráfico de vendas
export const salesChartSchema = validateCustomPeriod.extend({
    granularity: z.enum(['day', 'week', 'month']).default('day'),
    includeRevenue: z.coerce.boolean().default(true),
    includeOrders: z.coerce.boolean().default(true),
    userId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional()
})

// Schema para dados de gráfico de categorias
export const categoryChartSchema = validateCustomPeriod.extend({
    chartType: z.enum(['pie', 'bar', 'doughnut']).default('pie'),
    includePercentage: z.coerce.boolean().default(true),
    topN: z.coerce.number().min(3).max(20).default(10),
    userId: z.coerce.number().optional()
})

// Schema para relatório mensal
export const monthlyReportSchema = z.object({
    year: z.coerce.number().min(2020).max(2030),
    month: z.coerce.number().min(1).max(12),
    includeComparison: z.coerce.boolean().default(true),
    includeDetails: z.coerce.boolean().default(false),
    format: z.enum(['json', 'csv', 'pdf']).default('json')
})

// Schema para alertas
export const alertsSchema = z.object({
    types: z.array(z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'HIGH_SALES', 'LOW_SALES'])).default(['LOW_STOCK', 'OUT_OF_STOCK']),
    priority: z.enum(['ALL', 'HIGH', 'MEDIUM', 'LOW']).default('ALL'),
    limit: z.coerce.number().min(1).max(50).default(10),
    includeResolved: z.coerce.boolean().default(false)
})

// =================== TIPOS DERIVADOS ===================

export type DashboardOverviewInput = z.infer<typeof dashboardOverviewSchema>
export type TopProductsInput = z.infer<typeof topProductsSchema>
export type UserPerformanceInput = z.infer<typeof userPerformanceSchema>
export type CategoryMetricsInput = z.infer<typeof categoryMetricsSchema>
export type InventoryAnalysisInput = z.infer<typeof inventoryAnalysisSchema>
export type SalesChartInput = z.infer<typeof salesChartSchema>
export type CategoryChartInput = z.infer<typeof categoryChartSchema>
export type MonthlyReportInput = z.infer<typeof monthlyReportSchema>
export type AlertsInput = z.infer<typeof alertsSchema>

// =================== FUNÇÕES UTILITÁRIAS ===================

export function getPeriodDates(period: string, dateFrom?: Date, dateTo?: Date, timezone = 'America/Sao_Paulo') {
    const now = new Date()
    let from: Date, to: Date, compareFrom: Date, compareTo: Date

    switch (period) {
        case 'today':
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            to = new Date(from.getTime() + 24 * 60 * 60 * 1000)
            compareFrom = new Date(from.getTime() - 24 * 60 * 60 * 1000)
            compareTo = from
            break

        case 'week':
            const startOfWeek = now.getDate() - now.getDay()
            from = new Date(now.getFullYear(), now.getMonth(), startOfWeek)
            to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)
            compareFrom = new Date(from.getTime() - 7 * 24 * 60 * 60 * 1000)
            compareTo = from
            break

        case 'month':
            from = new Date(now.getFullYear(), now.getMonth(), 1)
            to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            compareFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            compareTo = from
            break

        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            from = new Date(now.getFullYear(), quarter * 3, 1)
            to = new Date(now.getFullYear(), (quarter + 1) * 3, 1)
            compareFrom = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
            compareTo = from
            break

        case 'year':
            from = new Date(now.getFullYear(), 0, 1)
            to = new Date(now.getFullYear() + 1, 0, 1)
            compareFrom = new Date(now.getFullYear() - 1, 0, 1)
            compareTo = from
            break

        case 'custom':
            if (!dateFrom || !dateTo) {
                throw new Error('dateFrom e dateTo são obrigatórios para período customizado')
            }
            from = dateFrom
            to = dateTo
            const diffMs = to.getTime() - from.getTime()
            compareFrom = new Date(from.getTime() - diffMs)
            compareTo = from
            break

        default:
            throw new Error(`Período inválido: ${period}`)
    }

    return {
        dateFrom: from,
        dateTo: to,
        compareFrom,
        compareTo
    }
}

export function calculateGrowth(current: number | null, previous: number | null): number {
    if (!current || !previous || previous === 0) return 0
    return ((current - previous) / previous) * 100
}

export function formatCurrency(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

export function formatPercentage(value: number, decimals = 2): string {
    return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}