// types/report.ts
import { SaleStatus } from '@prisma/client'

// =================== ENUMS E CONSTANTES ===================

export const REPORT_TYPES = [
    'sales',
    'products',
    'financial',
    'customers',
    'inventory'
] as const

export type ReportType = typeof REPORT_TYPES[number]

export const REPORT_FORMATS = ['json', 'pdf', 'excel', 'csv'] as const
export type ReportFormat = typeof REPORT_FORMATS[number]

export const REPORT_PERIODS = [
    'today',
    'yesterday',
    'last7days',
    'last30days',
    'thisMonth',
    'lastMonth',
    'thisQuarter',
    'lastQuarter',
    'thisYear',
    'lastYear',
    'custom'
] as const
export type ReportPeriod = typeof REPORT_PERIODS[number]

// =================== TIPOS BASE ===================

export interface ReportFilters {
    type: ReportType
    period?: ReportPeriod
    startDate?: Date
    endDate?: Date
    format?: ReportFormat
    groupBy?: string
    includeDetails?: boolean
}

export interface ReportMetadata {
    id: string
    type: ReportType
    title: string
    description: string
    generatedAt: Date
    generatedBy: string
    filters: ReportFilters
    rowCount?: number
}

// =================== RELATÓRIOS DE VENDAS ===================

export interface SalesReportFilters extends ReportFilters {
    type: 'sales'
    vendorId?: number
    customerId?: number
    categoryId?: number
    status?: SaleStatus
    minValue?: number
    maxValue?: number
}

export interface SalesReportData {
    summary: {
        totalSales: number
        totalRevenue: number
        averageTicket: number
        totalCustomers: number
        totalProducts: number
        period: string
    }
    byPeriod: Array<{
        date: string
        sales: number
        revenue: number
        averageTicket: number
    }>
    byVendor?: Array<{
        vendorId: number
        vendorName: string
        totalSales: number
        totalRevenue: number
        commission?: number
    }>
    byCategory?: Array<{
        categoryId: number
        categoryName: string
        quantitySold: number
        revenue: number
        percentage: number
    }>
    topProducts?: Array<{
        productId: number
        productName: string
        productCode: string
        quantitySold: number
        revenue: number
    }>
    topCustomers?: Array<{
        customerId: number
        customerName: string
        customerType: string
        purchases: number
        totalSpent: number
    }>
}

// =================== RELATÓRIOS DE PRODUTOS ===================

export interface ProductReportFilters extends ReportFilters {
    type: 'products'
    categoryId?: number
    supplierId?: number
    includeInactive?: boolean
    stockStatus?: 'all' | 'low' | 'out' | 'normal'
}

export interface ProductReportData {
    summary: {
        totalProducts: number
        activeProducts: number
        lowStockProducts: number
        outOfStockProducts: number
        totalInventoryValue: number
    }
    products: Array<{
        id: number
        code: string
        name: string
        category: string
        currentStock: number
        minStock: number
        stockStatus: string
        price: number
        inventoryValue: number
        lastSale?: Date
        salesLast30Days?: number
    }>
    abcAnalysis?: {
        classA: Array<{ productId: number; name: string; revenue: number; percentage: number }>
        classB: Array<{ productId: number; name: string; revenue: number; percentage: number }>
        classC: Array<{ productId: number; name: string; revenue: number; percentage: number }>
    }
    turnover?: Array<{
        productId: number
        name: string
        turnoverRate: number
        daysInStock: number
    }>
}

// =================== RELATÓRIOS FINANCEIROS ===================

export interface FinancialReportFilters extends ReportFilters {
    type: 'financial'
    includeProjections?: boolean
    includeTaxes?: boolean
}

export interface FinancialReportData {
    summary: {
        grossRevenue: number
        netRevenue: number
        totalCosts: number
        grossProfit: number
        grossMargin: number
        netProfit: number
        netMargin: number
    }
    cashFlow: Array<{
        date: string
        inflow: number
        outflow: number
        balance: number
    }>
    receivables: {
        total: number
        overdue: number
        toReceive: number
        byPeriod: Array<{
            period: string
            amount: number
            count: number
        }>
    }
    paymentMethods: Array<{
        method: string
        amount: number
        percentage: number
        transactionCount: number
    }>
    monthlyComparison?: Array<{
        month: string
        currentYear: number
        previousYear: number
        growth: number
    }>
}

// =================== RELATÓRIOS DE CLIENTES ===================

export interface CustomerReportFilters extends ReportFilters {
    type: 'customers'
    customerType?: 'RETAIL' | 'WHOLESALE'
    onlyActive?: boolean
    minPurchases?: number
    city?: string
    state?: string
}

export interface CustomerReportData {
    summary: {
        totalCustomers: number
        newCustomers: number
        activeCustomers: number
        averagePurchaseValue: number
        totalRevenue: number
    }
    segmentation: {
        byType: Array<{
            type: string
            count: number
            revenue: number
            percentage: number
        }>
        byLocation: Array<{
            state: string
            city?: string
            customers: number
            revenue: number
        }>
    }
    ranking: Array<{
        customerId: number
        name: string
        type: string
        totalPurchases: number
        totalSpent: number
        averageTicket: number
        lastPurchase: Date
        daysInactive?: number
    }>
    rfmAnalysis?: {
        champions: Array<{ customerId: number; name: string; score: number }>
        loyal: Array<{ customerId: number; name: string; score: number }>
        potential: Array<{ customerId: number; name: string; score: number }>
        new: Array<{ customerId: number; name: string; score: number }>
        lapsing: Array<{ customerId: number; name: string; score: number }>
        lost: Array<{ customerId: number; name: string; score: number }>
    }
}

// =================== RELATÓRIOS DE ESTOQUE ===================

export interface InventoryReportFilters extends ReportFilters {
    type: 'inventory'
    categoryId?: number
    location?: string
    includeMovements?: boolean
}

export interface InventoryReportData {
    summary: {
        totalItems: number
        totalQuantity: number
        totalValue: number
        itemsLowStock: number
        itemsOutOfStock: number
        itemsOverstock: number
    }
    inventory: Array<{
        productId: number
        productCode: string
        productName: string
        category: string
        quantity: number
        minStock: number
        maxStock?: number
        value: number
        status: 'normal' | 'low' | 'critical' | 'out' | 'overstock'
        lastMovement?: Date
        location?: string
    }>
    movements?: Array<{
        date: Date
        productId: number
        productName: string
        type: 'IN' | 'OUT' | 'ADJUSTMENT'
        quantity: number
        reason?: string
        user: string
    }>
    reorderList?: Array<{
        productId: number
        productName: string
        currentStock: number
        minStock: number
        suggestedOrder: number
        supplier?: string
    }>
    valuation: {
        byCategory: Array<{
            category: string
            items: number
            quantity: number
            value: number
            percentage: number
        }>
        byLocation?: Array<{
            location: string
            items: number
            value: number
        }>
    }
}

// =================== TIPOS DE RESPOSTA ===================

export interface ReportResponse<T = any> {
    metadata: ReportMetadata
    data: T
}

export interface ScheduledReport {
    id: number
    name: string
    type: ReportType
    filters: ReportFilters
    schedule: {
        frequency: 'daily' | 'weekly' | 'monthly'
        time?: string
        dayOfWeek?: number
        dayOfMonth?: number
    }
    recipients: string[]
    format: ReportFormat
    isActive: boolean
    lastRun?: Date
    nextRun?: Date
    createdAt: Date
    updatedAt: Date
}

export interface ReportTemplate {
    id: number
    name: string
    description?: string
    type: ReportType
    filters: ReportFilters
    isPublic: boolean
    createdBy: string
    createdAt: Date
    usageCount: number
}

// =================== CONSTANTES ===================

export const REPORT_LIMITS = {
    MAX_EXPORT_ROWS: 10000,
    MAX_DATE_RANGE_DAYS: 365,
    DEFAULT_TOP_ITEMS: 10,
    MAX_TOP_ITEMS: 100
} as const

export const REPORT_TITLES: Record<ReportType, string> = {
    sales: 'Relatório de Vendas',
    products: 'Relatório de Produtos',
    financial: 'Relatório Financeiro',
    customers: 'Relatório de Clientes',
    inventory: 'Relatório de Estoque'
}

export const REPORT_DESCRIPTIONS: Record<ReportType, string> = {
    sales: 'Análise detalhada de vendas, performance e tendências',
    products: 'Visão geral de produtos, estoque e movimentação',
    financial: 'Indicadores financeiros, faturamento e fluxo de caixa',
    customers: 'Análise de clientes, segmentação e comportamento',
    inventory: 'Posição de estoque, valorização e necessidades de reposição'
}