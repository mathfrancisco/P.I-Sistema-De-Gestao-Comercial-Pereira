// hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react'
import {
    DashboardOverview,
    DashboardFilters,
    ProductSaleMetric,
    UserSalesMetric,
    CategorySalesMetric,
    CustomerMetric,
    InventoryAlert,
    SalesChartData,
    CategoryChartData,
    DashboardResponse
} from '@/types/dashboard'

// =================== INTERFACES PRINCIPAIS ===================

interface UseDashboardReturn {
    // Dados principais
    overview: DashboardOverview | null
    topProducts: ProductSaleMetric[]
    userPerformance: UserSalesMetric[]
    categoryMetrics: CategorySalesMetric[]
    topCustomers: CustomerMetric[]
    inventoryAlerts: InventoryAlert[]
    salesChartData: SalesChartData[]
    categoryChartData: CategoryChartData[]

    // Estados de controle
    loading: boolean
    error: string | null
    loadingStates: {
        overview: boolean
        topProducts: boolean
        userPerformance: boolean
        categoryMetrics: boolean
        inventoryAlerts: boolean
        charts: boolean
    }

    // Metadados
    metadata: {
        lastUpdate: Date | null
        cached: boolean
        cacheExpiry: Date | null
        queryTime: number
    }

    // Funções de ação
    refresh: () => Promise<void>
    refreshOverview: () => Promise<DashboardOverview | null>
    refreshTopProducts: (limit?: number) => Promise<ProductSaleMetric[]>
    refreshUserPerformance: (userId?: number) => Promise<UserSalesMetric[]>
    refreshCategoryMetrics: (categoryId?: number) => Promise<CategorySalesMetric[]>
    refreshInventoryAlerts: (urgencyLevel?: string) => Promise<InventoryAlert[]>
    refreshCharts: () => Promise<{ sales: SalesChartData[], categories: CategoryChartData[] }>

    // Filtros
    updateFilters: (newFilters: Partial<DashboardFilters>) => void
    resetFilters: () => void
    setDateRange: (dateFrom: Date, dateTo: Date) => void
    setPeriod: (period: DashboardFilters['period']) => void
}

interface UseDashboardOptions {
    autoRefresh?: boolean
    refreshInterval?: number // em ms
    enableCache?: boolean
    initialFilters?: Partial<DashboardFilters>
}

// =================== FILTROS PADRÃO ===================

const DEFAULT_FILTERS: DashboardFilters = {
    period: 'month',
    compareWith: 'previous',
    includeComparison: true,
    includeGrowth: true,
    includeTrends: true,
    limit: 10,
    sortBy: 'revenue',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

// =================== HOOK PRINCIPAL ===================

export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
    const {
        autoRefresh = false,
        refreshInterval = 300000, // 5 minutos
        enableCache = true,
        initialFilters = {}
    } = options

    // Estados principais
    const [overview, setOverview] = useState<DashboardOverview | null>(null)
    const [topProducts, setTopProducts] = useState<ProductSaleMetric[]>([])
    const [userPerformance, setUserPerformance] = useState<UserSalesMetric[]>([])
    const [categoryMetrics, setCategoryMetrics] = useState<CategorySalesMetric[]>([])
    const [topCustomers, setTopCustomers] = useState<CustomerMetric[]>([])
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
    const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([])
    const [categoryChartData, setCategoryChartData] = useState<CategoryChartData[]>([])

    // Estados de controle
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [loadingStates, setLoadingStates] = useState({
        overview: false,
        topProducts: false,
        userPerformance: false,
        categoryMetrics: false,
        inventoryAlerts: false,
        charts: false
    })

    // Metadados
    const [metadata, setMetadata] = useState({
        lastUpdate: null as Date | null,
        cached: false,
        cacheExpiry: null as Date | null,
        queryTime: 0
    })

    // Filtros
    const [filters, setFilters] = useState<DashboardFilters>({
        ...DEFAULT_FILTERS,
        ...initialFilters
    })

    // =================== FUNÇÕES AUXILIARES ===================

    const updateLoadingState = (key: string, isLoading: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: isLoading }))
    }

    const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
        const url = new URL(`/api/dashboard/${endpoint}`, window.location.origin)

        // Adicionar filtros principais
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, String(value))
            }
        })

        // Adicionar parâmetros específicos
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, String(value))
                }
            })
        }

        if (enableCache) {
            url.searchParams.append('cache', 'true')
        }

        return url.toString()
    }

    const handleApiError = (err: unknown, context: string) => {
        const message = err instanceof Error ? err.message : `Erro ao buscar ${context}`
        setError(message)
        console.error(`Dashboard API Error (${context}):`, err)
        return message
    }

    // =================== FUNÇÕES DE BUSCA ===================

    const fetchOverview = useCallback(async () => {
        try {
            updateLoadingState('overview', true)
            setError(null)

            const startTime = performance.now()
            const response = await fetch(buildApiUrl('overview'))

            if (!response.ok) {
                throw new Error(`Erro ao buscar visão geral: ${response.statusText}`)
            }

            const result: DashboardResponse<DashboardOverview> = await response.json()
            const queryTime = performance.now() - startTime

            setOverview(result.data)
            setMetadata({
                lastUpdate: new Date(result.metadata.generatedAt),
                cached: result.metadata.performance.cached,
                cacheExpiry: result.metadata.performance.cacheExpiry ?
                    new Date(result.metadata.performance.cacheExpiry) : null,
                queryTime: Math.round(queryTime)
            })

            return result.data
        } catch (err) {
            handleApiError(err, 'visão geral')
            return null
        } finally {
            updateLoadingState('overview', false)
        }
    }, [filters, enableCache])

    const fetchTopProducts = useCallback(async (limit?: number) => {
        try {
            updateLoadingState('topProducts', true)
            setError(null)

            const params = limit ? { limit } : {}
            const response = await fetch(buildApiUrl('top-products', params))

            if (!response.ok) {
                throw new Error(`Erro ao buscar top produtos: ${response.statusText}`)
            }

            const result = await response.json()
            setTopProducts(result.data || result)
            return result.data || result
        } catch (err) {
            handleApiError(err, 'top produtos')
            return []
        } finally {
            updateLoadingState('topProducts', false)
        }
    }, [filters, enableCache])

    const fetchUserPerformance = useCallback(async (userId?: number) => {
        try {
            updateLoadingState('userPerformance', true)
            setError(null)

            const params = userId ? { userId } : {}
            const response = await fetch(buildApiUrl('user-performance', params))

            if (!response.ok) {
                throw new Error(`Erro ao buscar performance de usuários: ${response.statusText}`)
            }

            const result = await response.json()
            setUserPerformance(result.data || result)
            return result.data || result
        } catch (err) {
            handleApiError(err, 'performance de usuários')
            return []
        } finally {
            updateLoadingState('userPerformance', false)
        }
    }, [filters, enableCache])

    const fetchCategoryMetrics = useCallback(async (categoryId?: number) => {
        try {
            updateLoadingState('categoryMetrics', true)
            setError(null)

            const params = categoryId ? { categoryId } : {}
            const response = await fetch(buildApiUrl('category-metrics', params))

            if (!response.ok) {
                throw new Error(`Erro ao buscar métricas de categorias: ${response.statusText}`)
            }

            const result = await response.json()
            setCategoryMetrics(result.data || result)
            return result.data || result
        } catch (err) {
            handleApiError(err, 'métricas de categorias')
            return []
        } finally {
            updateLoadingState('categoryMetrics', false)
        }
    }, [filters, enableCache])

    const fetchInventoryAlerts = useCallback(async (urgencyLevel?: string) => {
        try {
            updateLoadingState('inventoryAlerts', true)
            setError(null)

            const params = urgencyLevel ? { urgencyLevel } : {}
            const response = await fetch(buildApiUrl('inventory-alerts', params))

            if (!response.ok) {
                throw new Error(`Erro ao buscar alertas de estoque: ${response.statusText}`)
            }

            const result = await response.json()
            setInventoryAlerts(result.data || result)
            return result.data || result
        } catch (err) {
            handleApiError(err, 'alertas de estoque')
            return []
        } finally {
            updateLoadingState('inventoryAlerts', false)
        }
    }, [filters, enableCache])

    const fetchCharts = useCallback(async () => {
        try {
            updateLoadingState('charts', true)
            setError(null)

            const [salesResponse, categoryResponse] = await Promise.all([
                fetch(buildApiUrl('sales-chart')),
                fetch(buildApiUrl('category-chart'))
            ])

            if (!salesResponse.ok || !categoryResponse.ok) {
                throw new Error('Erro ao buscar dados dos gráficos')
            }

            const [salesResult, categoryResult] = await Promise.all([
                salesResponse.json(),
                categoryResponse.json()
            ])

            setSalesChartData(salesResult.data || salesResult)
            setCategoryChartData(categoryResult.data || categoryResult)

            return {
                sales: salesResult.data || salesResult,
                categories: categoryResult.data || categoryResult
            }
        } catch (err) {
            handleApiError(err, 'dados dos gráficos')
            return { sales: [], categories: [] }
        } finally {
            updateLoadingState('charts', false)
        }
    }, [filters, enableCache])

    // =================== FUNÇÕES DE REFRESH ===================

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            await Promise.all([
                fetchOverview(),
                fetchTopProducts(),
                fetchUserPerformance(),
                fetchCategoryMetrics(),
                fetchInventoryAlerts(),
                fetchCharts()
            ])
        } catch (err) {
            handleApiError(err, 'atualização completa')
        } finally {
            setLoading(false)
        }
    }, [
        fetchOverview,
        fetchTopProducts,
        fetchUserPerformance,
        fetchCategoryMetrics,
        fetchInventoryAlerts,
        fetchCharts
    ])

    // =================== FUNÇÕES DE FILTRO ===================

    const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters({ ...DEFAULT_FILTERS, ...initialFilters })
    }, [initialFilters])

    const setDateRange = useCallback((dateFrom: Date, dateTo: Date) => {
        setFilters(prev => ({
            ...prev,
            period: 'custom',
            dateFrom,
            dateTo
        }))
    }, [])

    const setPeriod = useCallback((period: DashboardFilters['period']) => {
        setFilters(prev => ({
            ...prev,
            period,
            dateFrom: undefined,
            dateTo: undefined
        }))
    }, [])

    // =================== EFFECTS ===================

    // Carregamento inicial
    useEffect(() => {
        refresh()
    }, [filters.period, filters.dateFrom, filters.dateTo, filters.userId, filters.categoryId])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(refresh, refreshInterval)
        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, refresh])

    // =================== RETURN ===================

    return {
        // Dados
        overview,
        topProducts,
        userPerformance,
        categoryMetrics,
        topCustomers,
        inventoryAlerts,
        salesChartData,
        categoryChartData,

        // Estados
        loading,
        error,
        loadingStates,
        metadata,

        // Ações
        refresh,
        refreshOverview: fetchOverview,
        refreshTopProducts: fetchTopProducts,
        refreshUserPerformance: fetchUserPerformance,
        refreshCategoryMetrics: fetchCategoryMetrics,
        refreshInventoryAlerts: fetchInventoryAlerts,
        refreshCharts: fetchCharts,

        // Filtros
        updateFilters,
        resetFilters,
        setDateRange,
        setPeriod
    }
}

// =================== HOOKS ESPECÍFICOS ===================

// Hook para overview apenas
export const useDashboardOverview = (filters?: Partial<DashboardFilters>) => {
    const { overview, loading, error, refreshOverview, metadata } = useDashboard({
        initialFilters: filters
    })

    return {
        overview,
        loading: loading,
        error,
        refresh: refreshOverview,
        metadata
    }
}

// Hook para top produtos apenas
export const useTopProducts = (limit: number = 10, filters?: Partial<DashboardFilters>) => {
    const { topProducts, loadingStates, error, refreshTopProducts } = useDashboard({
        initialFilters: { ...filters, limit }
    })

    return {
        products: topProducts,
        loading: loadingStates.topProducts,
        error,
        refresh: () => refreshTopProducts(limit)
    }
}

// Hook para alertas de inventário apenas
export const useInventoryDashboard = (urgencyLevel?: string, filters?: Partial<DashboardFilters>) => {
    const { inventoryAlerts, loadingStates, error, refreshInventoryAlerts } = useDashboard({
        initialFilters: filters
    })

    return {
        alerts: inventoryAlerts,
        loading: loadingStates.inventoryAlerts,
        error,
        refresh: () => refreshInventoryAlerts(urgencyLevel)
    }
}

// Hook para charts apenas
export const useDashboardCharts = (filters?: Partial<DashboardFilters>) => {
    const { salesChartData, categoryChartData, loadingStates, error, refreshCharts } = useDashboard({
        initialFilters: filters
    })

    return {
        salesData: salesChartData,
        categoryData: categoryChartData,
        loading: loadingStates.charts,
        error,
        refresh: refreshCharts
    }
}