// types/dashboard.ts
import { Decimal } from '@prisma/client/runtime/library'

// =================== INTERFACES PRINCIPAIS ===================

export interface DashboardOverview {
    // Métricas de vendas
    salesMetrics: {
        today: {
            count: number           // Vendas de hoje
            total: Decimal         // Faturamento de hoje
            average: Decimal       // Ticket médio de hoje
        }
        month: {
            count: number          // Vendas do mês
            total: Decimal        // Faturamento do mês
            average: Decimal      // Ticket médio do mês
            growth: number        // % crescimento vs mês anterior
        }
        year: {
            count: number         // Vendas do ano
            total: Decimal       // Faturamento do ano
            average: Decimal     // Ticket médio do ano
            growth: number       // % crescimento vs ano anterior
        }
    }

    // Métricas de produtos
    productMetrics: {
        totalProducts: number     // Total de produtos ativos
        lowStockCount: number    // Produtos com estoque baixo
        outOfStockCount: number  // Produtos em falta
        topSellingToday: ProductSaleMetric[]
    }

    // Métricas de clientes
    customerMetrics: {
        totalCustomers: number   // Total de clientes ativos
        newCustomersThisMonth: number
        topCustomers: CustomerMetric[]
    }

    // Métricas de performance
    performanceMetrics: {
        salesByUser: UserSalesMetric[]
        salesByCategory: CategorySalesMetric[]
        conversionRate: number   // Taxa de conversão
    }
}

export interface ProductSaleMetric {
    productId: number
    productName: string
    productCode: string
    categoryName: string
    totalQuantitySold: number
    totalRevenue: Decimal
    salesCount: number        // Número de vendas
    averageQuantityPerSale: number
    lastSaleDate: Date | null
    trend: 'UP' | 'DOWN' | 'STABLE'  // Tendência vs período anterior
}

export interface UserSalesMetric {
    userId: number
    userName: string
    userRole: string
    salesCount: number
    totalRevenue: Decimal
    averageOrderValue: Decimal
    topCategory: string      // Categoria que mais vende
    efficiency: number       // Vendas por dia ativo
    growth: number          // % crescimento vs período anterior
}

export interface CategorySalesMetric {
    categoryId: number
    categoryName: string
    cnae?: string
    salesCount: number
    totalRevenue: Decimal
    totalQuantitySold: number
    averageOrderValue: Decimal
    marketShare: number     // % do faturamento total
    growth: number         // % crescimento vs período anterior
    topProducts: ProductSaleMetric[]
}

export interface CustomerMetric {
    customerId: number
    customerName: string
    customerType: 'RETAIL' | 'WHOLESALE'
    totalPurchases: Decimal
    purchaseCount: number
    averageOrderValue: Decimal
    lastPurchaseDate: Date | null
    frequency: number       // Compras por mês
}

export interface InventoryAlert {
    productId: number
    productName: string
    productCode: string
    categoryName: string
    currentStock: number
    minStock: number
    maxStock: number
    salesLast30Days: number
    averageDailySales: number
    daysUntilOutOfStock: number
    urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    isOutOfStock: boolean
}

export interface SalesChartData {
    date: string
    sales: number
    revenue: number
    orders: number
}

export interface CategoryChartData {
    categoryName: string
    revenue: number
    percentage: number
    salesCount: number
}

// =================== RESPONSE PATTERNS ===================

export interface DashboardResponse<T> {
    data: T
    metadata: {
        generatedAt: Date
        period: {
            from: Date
            to: Date
            type: string
        }
        filters: Record<string, any>
        performance: {
            queryTime: number // ms
            cached: boolean
            cacheExpiry?: Date
        }
    }
    comparison?: {
        period: {
            from: Date
            to: Date
        }
        data: Partial<T>
        growth: Record<string, number>
    }
}

// =================== FILTROS E PARÂMETROS ===================

export interface DashboardFilters {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    dateFrom?: Date
    dateTo?: Date
    compareWith?: 'previous' | 'lastYear' | 'none'
    userId?: number
    categoryId?: number
    customerId?: number
    includeComparison?: boolean
    includeGrowth?: boolean
    includeTrends?: boolean
    limit?: number
    sortBy?: string
    timezone?: string
}

export interface PeriodDates {
    dateFrom: Date
    dateTo: Date
    compareFrom?: Date
    compareTo?: Date
}

// =================== UTILITÁRIOS ===================

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE'
export type SaleStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
export type UserRole = 'ADMIN' | 'MANAGER' | 'SALESPERSON'
export type CustomerType = 'RETAIL' | 'WHOLESALE'

// =================== CACHE STRATEGIES ===================

export interface CacheStrategy {
    key: string
    ttl: number // seconds
    tags: string[] // Para invalidação
}

export const CACHE_STRATEGIES = {
    dashboard_overview: { ttl: 300, tags: ['sales', 'products'] }, // 5 min
    top_products: { ttl: 600, tags: ['sales'] }, // 10 min
    user_performance: { ttl: 900, tags: ['sales'] }, // 15 min
    category_metrics: { ttl: 600, tags: ['sales'] }, // 10 min
    inventory_analysis: { ttl: 180, tags: ['inventory'] } // 3 min
} as const