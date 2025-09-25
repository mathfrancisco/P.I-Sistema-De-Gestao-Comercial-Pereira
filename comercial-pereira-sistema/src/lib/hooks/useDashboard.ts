import React, { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Decimal } from '@prisma/client/runtime/library'
import {
    DashboardOverview,
    ProductSaleMetric,
    SalesChartData,
    CategorySalesMetric,
    InventoryAlert,
    UserSalesMetric,
    DashboardResponse,
    DashboardFilters
} from '@/types/dashboard'

// =================== QUERY KEYS ===================

export const dashboardKeys = {
    all: ['dashboard'] as const,
    overview: (filters: DashboardFilters) => ['dashboard', 'overview', filters] as const,
    products: (filters: DashboardFilters) => ['dashboard', 'products', filters] as const,
    salesChart: (filters: DashboardFilters) => ['dashboard', 'sales-chart', filters] as const,
    categoryChart: (filters: DashboardFilters) => ['dashboard', 'category-chart', filters] as const,
    alerts: (filters: any) => ['dashboard', 'alerts', filters] as const,
    userPerformance: (filters: DashboardFilters) => ['dashboard', 'users', filters] as const,
} as const

// =================== API FUNCTIONS ===================

const API_ENDPOINTS = {
    overview: '/api/dashboard/overview',
    products: '/api/dashboard/products',
    salesChart: '/api/dashboard/charts/sales',
    categoryChart: '/api/dashboard/charts/categories',
    alerts: '/api/dashboard/alerts',
    userPerformance: '/api/dashboard/users'
} as const

async function fetchWithAuth<T>(url: string, params: Record<string, any> = {}): Promise<T> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString())
        }
    })

    const response = await fetch(`${url}?${searchParams.toString()}`, {
        headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(errorData.error || `Erro ${response.status}`)
    }

    const data: DashboardResponse<T> = await response.json()
    return data.data
}

// Query functions
const fetchOverview = (filters: DashboardFilters) =>
    fetchWithAuth<DashboardOverview>(API_ENDPOINTS.overview, filters)

const fetchTopProducts = (filters: DashboardFilters) =>
    fetchWithAuth<ProductSaleMetric[]>(API_ENDPOINTS.products, filters)

const fetchSalesChart = (filters: DashboardFilters & { granularity?: string }) =>
    fetchWithAuth<SalesChartData[]>(API_ENDPOINTS.salesChart, { ...filters, granularity: 'day' })

const fetchCategoryChart = (filters: DashboardFilters & { topN?: number }) =>
    fetchWithAuth<CategorySalesMetric[]>(API_ENDPOINTS.categoryChart, { ...filters, topN: 10 })

const fetchInventoryAlerts = (filters: { types?: string[], priority?: string }) =>
    fetchWithAuth<InventoryAlert[]>(API_ENDPOINTS.alerts, {
        types: filters.types || ['LOW_STOCK', 'OUT_OF_STOCK'],
        priority: filters.priority || 'ALL',
        limit: 20
    })

const fetchUserPerformance = (filters: DashboardFilters) =>
    fetchWithAuth<UserSalesMetric[]>(API_ENDPOINTS.userPerformance, filters)

// =================== CONFIGURAÇÕES DEFAULT ===================

const DEFAULT_FILTERS: DashboardFilters = {
    period: 'month',
    includeComparison: true,
    limit: 10
}

// Configurações de cache otimizadas por tipo de dado
const CACHE_CONFIG = {
    overview: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 }, // 5min stale, 10min cache
    products: { staleTime: 10 * 60 * 1000, cacheTime: 30 * 60 * 1000 }, // 10min stale, 30min cache
    salesChart: { staleTime: 2 * 60 * 1000, cacheTime: 15 * 60 * 1000 }, // 2min stale, 15min cache
    alerts: { staleTime: 1 * 60 * 1000, cacheTime: 5 * 60 * 1000 }, // 1min stale, 5min cache - dados críticos
    userPerformance: { staleTime: 15 * 60 * 1000, cacheTime: 60 * 60 * 1000 } // 15min stale, 1h cache
} as const

// =================== PERMISSION SYSTEM ===================

const checkPermission = (userRole: string, action: string): boolean => {
    if (userRole === 'ADMIN') return true
    if (userRole === 'MANAGER') return true
    if (userRole === 'SALESPERSON') {
        const allowedActions = ['dashboard:read', 'sales:read', 'products:read']
        return allowedActions.includes(action)
    }
    return false
}

// =================== MAIN HOOK ===================

interface UseDashboardOptions {
    enabled?: boolean
    refetchInterval?: number | false
    onError?: (error: Error) => void
}

export const useDashboard = (
    filters: Partial<DashboardFilters> = {},
    enabled: boolean = true,
    options: UseDashboardOptions = {}
) => {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    const finalFilters = { ...DEFAULT_FILTERS, ...filters }
    const canAccess = session && checkPermission(session.user.role, 'dashboard:read')

    // Rastrear última atualização real
    const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

    // =================== INDIVIDUAL QUERIES ===================

    const overviewQuery = useQuery({
        queryKey: dashboardKeys.overview(finalFilters),
        queryFn: () => fetchOverview(finalFilters),
        enabled: Boolean(enabled && canAccess),
        ...CACHE_CONFIG.overview,
        refetchInterval: options.refetchInterval,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    })

    const productsQuery = useQuery({
        queryKey: dashboardKeys.products(finalFilters),
        queryFn: () => fetchTopProducts(finalFilters),
        enabled: Boolean(enabled && canAccess && checkPermission(session?.user.role || '', 'products:read')),
        ...CACHE_CONFIG.products,
        refetchInterval: options.refetchInterval
    })

    const salesChartQuery = useQuery({
        queryKey: dashboardKeys.salesChart(finalFilters),
        queryFn: () => fetchSalesChart(finalFilters),
        enabled: Boolean(enabled && canAccess && checkPermission(session?.user.role || '', 'sales:read')),
        ...CACHE_CONFIG.salesChart,
        refetchInterval: options.refetchInterval
    })

    const alertsQuery = useQuery({
        queryKey: dashboardKeys.alerts({}),
        queryFn: () => fetchInventoryAlerts({}),
        enabled: Boolean(enabled && canAccess),
        ...CACHE_CONFIG.alerts,
        refetchInterval: 5 * 60 * 1000 // Alertas sempre com refresh automático
    })

    const userPerformanceQuery = useQuery({
        queryKey: dashboardKeys.userPerformance(finalFilters),
        queryFn: () => fetchUserPerformance(finalFilters),
        enabled: Boolean(enabled && canAccess && checkPermission(session?.user.role || '', 'dashboard:read')),
        ...CACHE_CONFIG.userPerformance
    })

    // =================== COMPUTED VALUES ===================

    const isLoading = overviewQuery.isLoading || productsQuery.isLoading || salesChartQuery.isLoading
    const isRefreshing = overviewQuery.isFetching || productsQuery.isFetching || salesChartQuery.isFetching

    const hasAnyError = overviewQuery.isError || productsQuery.isError || salesChartQuery.isError || alertsQuery.isError

    const errors = {
        overview: overviewQuery.error?.message || null,
        products: productsQuery.error?.message || null,
        salesChart: salesChartQuery.error?.message || null,
        alerts: alertsQuery.error?.message || null,
        userPerformance: userPerformanceQuery.error?.message || null
    }

    const loading = {
        overview: overviewQuery.isLoading,
        products: productsQuery.isLoading,
        salesChart: salesChartQuery.isLoading,
        categoryChart: false, // Implementar se necessário
        alerts: alertsQuery.isLoading,
        userPerformance: userPerformanceQuery.isLoading
    }

    // =================== ACTIONS ===================

    const refresh = useCallback(async () => {
        const queries = [
            overviewQuery.refetch(),
            productsQuery.refetch(),
            salesChartQuery.refetch(),
            alertsQuery.refetch()
        ]

        await Promise.allSettled(queries)
        setLastUpdated(new Date())
    }, [overviewQuery, productsQuery, salesChartQuery, alertsQuery])

    const refreshSection = useCallback(async (section: keyof typeof loading) => {
        const queryMap = {
            overview: overviewQuery,
            products: productsQuery,
            salesChart: salesChartQuery,
            alerts: alertsQuery,
            userPerformance: userPerformanceQuery,
            categoryChart: null // Implementar se necessário
        }

        const query = queryMap[section]
        if (query) {
            await query.refetch()
            setLastUpdated(new Date())
        }
    }, [overviewQuery, productsQuery, salesChartQuery, alertsQuery, userPerformanceQuery])

    const invalidateAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }, [queryClient])

    const prefetchData = useCallback((newFilters: Partial<DashboardFilters>) => {
        const prefetchFilters = { ...finalFilters, ...newFilters }

        // Prefetch dos dados mais importantes
        queryClient.prefetchQuery({
            queryKey: dashboardKeys.overview(prefetchFilters),
            queryFn: () => fetchOverview(prefetchFilters),
            staleTime: CACHE_CONFIG.overview.staleTime
        })

        queryClient.prefetchQuery({
            queryKey: dashboardKeys.products(prefetchFilters),
            queryFn: () => fetchTopProducts(prefetchFilters),
            staleTime: CACHE_CONFIG.products.staleTime
        })
    }, [queryClient, finalFilters])

    const clearErrors = useCallback(() => {
        // React Query gerencia os erros automaticamente
        // Mas podemos resetar queries com erro se necessário
        if (overviewQuery.isError) overviewQuery.refetch()
        if (productsQuery.isError) productsQuery.refetch()
        if (salesChartQuery.isError) salesChartQuery.refetch()
        if (alertsQuery.isError) alertsQuery.refetch()
    }, [overviewQuery, productsQuery, salesChartQuery, alertsQuery])

    const getLoadingStatus = useCallback(() => {
        const queries = [overviewQuery, productsQuery, salesChartQuery, alertsQuery]
        const total = queries.length
        const completed = queries.filter(q => !q.isLoading).length
        const percentage = Math.round((completed / total) * 100)

        return { completed, total, percentage }
    }, [overviewQuery, productsQuery, salesChartQuery, alertsQuery])

    // Função para buscar dados do gráfico de vendas com filtros específicos
    const fetchSalesChartWithFilters = useCallback(async (chartFilters: { period: string; granularity?: string }) => {
        const newFilters = { ...finalFilters, period: chartFilters.period as any, granularity: chartFilters.granularity }
        
        // Invalidar query atual e buscar com novos filtros
        await queryClient.invalidateQueries({ queryKey: dashboardKeys.salesChart(finalFilters) })
        
        return queryClient.fetchQuery({
            queryKey: dashboardKeys.salesChart(newFilters),
            queryFn: () => fetchSalesChart(newFilters),
            staleTime: CACHE_CONFIG.salesChart.staleTime
        })
    }, [queryClient, finalFilters])

    // =================== DEBUG LOGGING ===================
    
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Dashboard Data Status:', {
                overview: overviewQuery.data ? 'loaded' : 'empty',
                topProducts: Array.isArray(productsQuery.data) ? productsQuery.data.length : 0,
                salesChart: Array.isArray(salesChartQuery.data) ? salesChartQuery.data.length : 0,
                alerts: Array.isArray(alertsQuery.data) ? alertsQuery.data.length : 0,
                errors: {
                    overview: overviewQuery.error?.message,
                    products: productsQuery.error?.message,
                    salesChart: salesChartQuery.error?.message,
                    alerts: alertsQuery.error?.message
                }
            })
        }
    }, [overviewQuery.data, productsQuery.data, salesChartQuery.data, alertsQuery.data])

    // =================== MOCK DATA FOR DEVELOPMENT ===================
    
    const getMockData = useCallback(() => {
        const shouldUseMock = process.env.NODE_ENV === 'development' && !overviewQuery.data

        if (shouldUseMock) {
            return {
                overview: {
                    salesMetrics: {
                        today: {
                            count: 5,
                            total: new Decimal(2500),
                            average: new Decimal(500)
                        },
                        month: {
                            count: 45,
                            total: new Decimal(125000),
                            average: new Decimal(2778),
                            growth: 15.5
                        },
                        year: {
                            count: 420,
                            total: new Decimal(1250000),
                            average: new Decimal(2976),
                            growth: 8.3
                        }
                    },
                    productMetrics: {
                        totalProducts: 150,
                        lowStockCount: 8,
                        outOfStockCount: 3,
                        topSellingToday: []
                    },
                    customerMetrics: {
                        totalCustomers: 320,
                        newCustomersThisMonth: 25,
                        topCustomers: []
                    },
                    performanceMetrics: {
                        salesByUser: [],
                        salesByCategory: [],
                        conversionRate: 0.65
                    }
                },
                topProducts: [
                    {
                        productId: 1,
                        productName: 'Produto Demo 1',
                        productCode: 'DEMO001',
                        categoryName: 'Categoria Demo',
                        totalQuantitySold: 50,
                        totalRevenue: new Decimal(5000),
                        salesCount: 15,
                        averageQuantityPerSale: 3.33,
                        lastSaleDate: new Date(),
                        trend: 'UP' as const
                    },
                    {
                        productId: 2,
                        productName: 'Produto Demo 2',
                        productCode: 'DEMO002',
                        categoryName: 'Categoria Demo',
                        totalQuantitySold: 35,
                        totalRevenue: new Decimal(3500),
                        salesCount: 12,
                        averageQuantityPerSale: 2.92,
                        lastSaleDate: new Date(),
                        trend: 'STABLE' as const
                    }
                ],
                salesChart: [
                    { date: '2024-09-01', sales: 1200, revenue: 15000, orders: 12 },
                    { date: '2024-09-02', sales: 1500, revenue: 18000, orders: 15 },
                    { date: '2024-09-03', sales: 1800, revenue: 22000, orders: 18 },
                    { date: '2024-09-04', sales: 1300, revenue: 16000, orders: 13 },
                    { date: '2024-09-05', sales: 2000, revenue: 25000, orders: 20 }
                ],
                inventoryAlerts: [
                    {
                        productId: 3,
                        productName: 'Produto Baixo Estoque',
                        productCode: 'LOW001',
                        categoryName: 'Categoria Crítica',
                        currentStock: 5,
                        minStock: 10,
                        maxStock: 50,
                        salesLast30Days: 45,
                        averageDailySales: 1.5,
                        daysUntilOutOfStock: 3,
                        urgencyLevel: 'CRITICAL' as const,
                        isOutOfStock: false
                    }
                ]
            }
        }

        return null
    }, [overviewQuery.data])

    const mockData = getMockData()

    // =================== RETURN ===================

    return {
        // Dados - com fallback para mock em desenvolvimento
        overview: overviewQuery.data || mockData?.overview || null,
        topProducts: productsQuery.data || mockData?.topProducts || [],
        salesChart: salesChartQuery.data || mockData?.salesChart || [],
        categoryChart: [], // Implementar se necessário
        inventoryAlerts: alertsQuery.data || mockData?.inventoryAlerts || [],
        userPerformance: userPerformanceQuery.data || [],

        // Estados
        loading,
        errors,
        isLoading,
        isRefreshing,
        hasAnyError,
        lastUpdated,

        // Ações
        refresh,
        refreshSection,
        clearErrors,
        invalidateAll,
        prefetchData,
        fetchSalesChart: fetchSalesChartWithFilters, // CORRIGIDO: Agora está disponível

        // Utilidades
        getLoadingStatus,
        hasPermission: (action: string) => checkPermission(session?.user.role || '', action), // CORRIGIDO: Função properly exposed

        // Query objects para controle avançado
        queries: {
            overview: overviewQuery,
            products: productsQuery,
            salesChart: salesChartQuery,
            alerts: alertsQuery,
            userPerformance: userPerformanceQuery
        },

        // Debug info
        debug: process.env.NODE_ENV === 'development' ? {
            usingMockData: !!mockData,
            queryStates: {
                overview: { loading: overviewQuery.isLoading, error: !!overviewQuery.error, data: !!overviewQuery.data },
                products: { loading: productsQuery.isLoading, error: !!productsQuery.error, data: !!productsQuery.data },
                salesChart: { loading: salesChartQuery.isLoading, error: !!salesChartQuery.error, data: !!salesChartQuery.data },
                alerts: { loading: alertsQuery.isLoading, error: !!alertsQuery.error, data: !!alertsQuery.data }
            }
        } : undefined
    }
}

// =================== FILTERS HOOK ===================

export const useDashboardFilters = (initialFilters: Partial<DashboardFilters> = {}) => {
    const queryClient = useQueryClient()

    const [filters, setFilters] = React.useState<DashboardFilters>({
        ...DEFAULT_FILTERS,
        ...initialFilters
    })

    const updateFilter = useCallback(<K extends keyof DashboardFilters>(
        key: K,
        value: DashboardFilters[K]
    ) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value }

            // Prefetch com novos filtros
            queryClient.prefetchQuery({
                queryKey: dashboardKeys.overview(newFilters),
                queryFn: () => fetchOverview(newFilters),
                staleTime: CACHE_CONFIG.overview.staleTime
            })

            return newFilters
        })
    }, [queryClient])

    const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS)
    }, [])

    return {
        filters,
        updateFilter,
        updateFilters,
        resetFilters
    }
}

// =================== UTILITY HOOKS ===================

// Hook para dados específicos com cache otimizado
export const useDashboardOverview = (filters: Partial<DashboardFilters> = {}) => {
    const { data: session } = useSession()
    const finalFilters = { ...DEFAULT_FILTERS, ...filters }

    return useQuery({
        queryKey: dashboardKeys.overview(finalFilters),
        queryFn: () => fetchOverview(finalFilters),
        enabled: Boolean(session && checkPermission(session.user.role, 'dashboard:read')),
        ...CACHE_CONFIG.overview,
        select: (data) => data, // Pode transformar dados aqui se necessário
    })
}

// Hook para alertas críticos (sempre atualizado)
export const useCriticalAlerts = () => {
    const { data: session } = useSession()

    return useQuery({
        queryKey: dashboardKeys.alerts({ priority: 'CRITICAL' }),
        queryFn: () => fetchInventoryAlerts({ priority: 'CRITICAL' }),
        enabled: Boolean(session),
        staleTime: 30 * 1000, // 30 segundos para alertas crítico
        refetchInterval: 60 * 1000, // Refetch a cada minuto
        select: (data) => data.filter(alert => alert.urgencyLevel === 'CRITICAL')
    })
}