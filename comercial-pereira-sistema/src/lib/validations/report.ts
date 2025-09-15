// lib/validations/report.ts
import { z } from 'zod'
import {
    type ReportType,
    type ReportPeriod,
    type SalesReportFilters,
    type ProductReportFilters,
    type FinancialReportFilters,
    type CustomerReportFilters,
    type InventoryReportFilters,
    REPORT_TYPES,
    REPORT_FORMATS,
    REPORT_PERIODS,
    REPORT_LIMITS
} from '@/types/report'

// =================== SCHEMAS BASE ===================

export const reportPeriodSchema = z.enum(REPORT_PERIODS)
export const reportTypeSchema = z.enum(REPORT_TYPES)
export const reportFormatSchema = z.enum(REPORT_FORMATS)

export const dateRangeSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
}).refine((data) => {
    const daysDiff = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= REPORT_LIMITS.MAX_DATE_RANGE_DAYS
}, {
    message: `Período máximo permitido é ${REPORT_LIMITS.MAX_DATE_RANGE_DAYS} dias`
}).refine((data) => {
    return data.startDate <= data.endDate
}, {
    message: "Data inicial deve ser anterior à data final"
})

export const baseReportFiltersSchema = z.object({
    type: reportTypeSchema,
    period: reportPeriodSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    format: reportFormatSchema.default('json'),
    groupBy: z.string().optional(),
    includeDetails: z.coerce.boolean().default(false)
}).refine((data) => {
    // Se period é 'custom', startDate e endDate são obrigatórios
    if (data.period === 'custom') {
        return data.startDate && data.endDate
    }
    return true
}, {
    message: "Para período customizado, datas inicial e final são obrigatórias"
})

// =================== SALES REPORT SCHEMA ===================

export const salesReportFiltersSchema = baseReportFiltersSchema.extend({
    type: z.literal('sales'),
    vendorId: z.coerce.number().int().positive().optional(),
    customerId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
    minValue: z.coerce.number().positive().optional(),
    maxValue: z.coerce.number().positive().optional()
}).refine((data) => {
    if (data.minValue && data.maxValue) {
        return data.minValue <= data.maxValue
    }
    return true
}, {
    message: "Valor mínimo deve ser menor que valor máximo"
}) satisfies z.ZodType<SalesReportFilters>

// =================== PRODUCT REPORT SCHEMA ===================

export const productReportFiltersSchema = baseReportFiltersSchema.extend({
    type: z.literal('products'),
    categoryId: z.coerce.number().int().positive().optional(),
    supplierId: z.coerce.number().int().positive().optional(),
    includeInactive: z.coerce.boolean().default(false),
    stockStatus: z.enum(['all', 'low', 'out', 'normal']).default('all')
}) satisfies z.ZodType<ProductReportFilters>

// =================== FINANCIAL REPORT SCHEMA ===================

export const financialReportFiltersSchema = baseReportFiltersSchema.extend({
    type: z.literal('financial'),
    includeProjections: z.coerce.boolean().default(false),
    includeTaxes: z.coerce.boolean().default(false)
}) satisfies z.ZodType<FinancialReportFilters>

// =================== CUSTOMER REPORT SCHEMA ===================

export const customerReportFiltersSchema = baseReportFiltersSchema.extend({
    type: z.literal('customers'),
    customerType: z.enum(['RETAIL', 'WHOLESALE']).optional(),
    onlyActive: z.coerce.boolean().default(true),
    minPurchases: z.coerce.number().int().min(1).optional(),
    city: z.string().max(100).optional(),
    state: z.string().length(2).optional()
}) satisfies z.ZodType<CustomerReportFilters>

// =================== INVENTORY REPORT SCHEMA ===================

export const inventoryReportFiltersSchema = baseReportFiltersSchema.extend({
    type: z.literal('inventory'),
    categoryId: z.coerce.number().int().positive().optional(),
    location: z.string().max(100).optional(),
    includeMovements: z.coerce.boolean().default(false)
}) satisfies z.ZodType<InventoryReportFilters>

// =================== SCHEDULED REPORT SCHEMAS ===================

export const scheduledReportSchema = z.object({
    name: z.string().min(1).max(100),
    type: reportTypeSchema,
    filters: z.record(z.any()),
    schedule: z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly']),
        time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
        dayOfWeek: z.number().int().min(0).max(6).optional(),
        dayOfMonth: z.number().int().min(1).max(31).optional()
    }),
    recipients: z.array(z.string().email()).min(1),
    format: reportFormatSchema,
    isActive: z.boolean().default(true)
})

// =================== REPORT TEMPLATE SCHEMAS ===================

export const reportTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: reportTypeSchema,
    filters: z.record(z.any()),
    isPublic: z.boolean().default(false)
})

// =================== EXPORT REQUEST SCHEMA ===================

export const exportReportSchema = z.object({
    format: reportFormatSchema,
    includeHeaders: z.boolean().default(true),
    includeFooter: z.boolean().default(true),
    includeSummary: z.boolean().default(true),
    emailTo: z.string().email().optional()
})

// =================== TIPOS DERIVADOS ===================

export type SalesReportFiltersInput = z.infer<typeof salesReportFiltersSchema>
export type ProductReportFiltersInput = z.infer<typeof productReportFiltersSchema>
export type FinancialReportFiltersInput = z.infer<typeof financialReportFiltersSchema>
export type CustomerReportFiltersInput = z.infer<typeof customerReportFiltersSchema>
export type InventoryReportFiltersInput = z.infer<typeof inventoryReportFiltersSchema>
export type ScheduledReportInput = z.infer<typeof scheduledReportSchema>
export type ReportTemplateInput = z.infer<typeof reportTemplateSchema>
export type ExportReportInput = z.infer<typeof exportReportSchema>

// =================== HELPERS ===================

export const getReportSchema = (type: ReportType) => {
    switch (type) {
        case 'sales':
            return salesReportFiltersSchema
        case 'products':
            return productReportFiltersSchema
        case 'financial':
            return financialReportFiltersSchema
        case 'customers':
            return customerReportFiltersSchema
        case 'inventory':
            return inventoryReportFiltersSchema
        default:
            throw new Error(`Tipo de relatório inválido: ${type}`)
    }
}

export const calculateDateRange = (period: ReportPeriod): { startDate: Date; endDate: Date } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
        case 'today':
            return { startDate: today, endDate: now }

        case 'yesterday':
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return { startDate: yesterday, endDate: today }

        case 'last7days':
            const week = new Date(today)
            week.setDate(week.getDate() - 7)
            return { startDate: week, endDate: now }

        case 'last30days':
            const month = new Date(today)
            month.setDate(month.getDate() - 30)
            return { startDate: month, endDate: now }

        case 'thisMonth':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            return { startDate: monthStart, endDate: now }

        case 'lastMonth':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
            return { startDate: lastMonthStart, endDate: lastMonthEnd }

        case 'thisQuarter':
            const quarter = Math.floor(now.getMonth() / 3)
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1)
            return { startDate: quarterStart, endDate: now }

        case 'lastQuarter':
            const lastQuarter = Math.floor(now.getMonth() / 3) - 1
            const lastQuarterStart = new Date(now.getFullYear(), lastQuarter * 3, 1)
            const lastQuarterEnd = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0)
            return { startDate: lastQuarterStart, endDate: lastQuarterEnd }

        case 'thisYear':
            const yearStart = new Date(now.getFullYear(), 0, 1)
            return { startDate: yearStart, endDate: now }

        case 'lastYear':
            const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
            const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)
            return { startDate: lastYearStart, endDate: lastYearEnd }

        default:
            return { startDate: today, endDate: now }
    }
}

// =================== ERROR MESSAGES ===================

export const REPORT_ERROR_MESSAGES = {
    INSUFFICIENT_PERMISSION: 'Permissão insuficiente para gerar relatórios',
    INVALID_TYPE: 'Tipo de relatório inválido',
    INVALID_PERIOD: 'Período inválido',
    INVALID_DATE_RANGE: 'Intervalo de datas inválido',
    NO_DATA: 'Nenhum dado encontrado para os filtros selecionados',
    EXPORT_FAILED: 'Erro ao exportar relatório',
    TEMPLATE_NOT_FOUND: 'Template de relatório não encontrado',
    SCHEDULE_NOT_FOUND: 'Agendamento não encontrado'
} as const