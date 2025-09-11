// lib/cache/dashboard.ts

// Sistema de cache em memória simples (pode ser substituído por Redis em produção)
class MemoryCache {
    private cache = new Map<string, { data: any; expiry: number; tags: string[] }>()

    set(key: string, data: any, ttlSeconds: number, tags: string[] = []) {
        const expiry = Date.now() + (ttlSeconds * 1000)
        this.cache.set(key, { data, expiry, tags })
    }

    get(key: string) {
        const item = this.cache.get(key)
        if (!item) return null

        if (Date.now() > item.expiry) {
            this.cache.delete(key)
            return null
        }

        return item.data
    }

    delete(key: string) {
        this.cache.delete(key)
    }

    invalidateByTag(tag: string) {
        for (const [key, item] of this.cache.entries()) {
            if (item.tags.includes(tag)) {
                this.cache.delete(key)
            }
        }
    }

    clear() {
        this.cache.clear()
    }

    size() {
        return this.cache.size
    }

    // Limpeza de cache expirado
    cleanup() {
        const now = Date.now()
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key)
            }
        }
    }
}

// Instância global do cache
const dashboardCache = new MemoryCache()

// Limpeza automática a cada 5 minutos
setInterval(() => {
    dashboardCache.cleanup()
}, 5 * 60 * 1000)

// =================== ESTRATÉGIAS DE CACHE ===================

export const CACHE_STRATEGIES = {
    dashboard_overview: { ttl: 300, tags: ['sales', 'products', 'customers'] }, // 5 min
    top_products: { ttl: 600, tags: ['sales', 'products'] }, // 10 min
    user_performance: { ttl: 900, tags: ['sales'] }, // 15 min
    category_metrics: { ttl: 600, tags: ['sales', 'categories'] }, // 10 min
    inventory_analysis: { ttl: 180, tags: ['inventory'] }, // 3 min
    sales_chart: { ttl: 300, tags: ['sales'] }, // 5 min
    category_chart: { ttl: 600, tags: ['sales', 'categories'] }, // 10 min
    alerts: { ttl: 120, tags: ['inventory', 'sales'] } // 2 min
} as const

// =================== FUNÇÕES DE CACHE ===================

export async function getCachedData<T>(
    cacheKey: string,
    queryFunction: () => Promise<T>,
    strategy: keyof typeof CACHE_STRATEGIES
): Promise<{ data: T; cached: boolean; cacheExpiry?: Date }> {
    // Tentar buscar do cache primeiro
    const cached = dashboardCache.get(cacheKey)
    if (cached) {
        return {
            data: cached,
            cached: true,
            cacheExpiry: new Date(Date.now() + CACHE_STRATEGIES[strategy].ttl * 1000)
        }
    }

    // Se não estiver em cache, executar query
    const data = await queryFunction()

    // Salvar no cache
    const { ttl, tags } = CACHE_STRATEGIES[strategy]
    dashboardCache.set(cacheKey, data, ttl, tags)

    return {
        data,
        cached: false
    }
}

export function generateCacheKey(
    endpoint: string,
    params: Record<string, any>,
    userId?: number
): string {
    // Criar chave única baseada no endpoint, parâmetros e usuário
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&')

    const userPart = userId ? `user:${userId}` : 'public'
    return `dashboard:${endpoint}:${userPart}:${sortedParams}`
}

export function invalidateCache(tags: string | string[]) {
    const tagsArray = Array.isArray(tags) ? tags : [tags]

    tagsArray.forEach(tag => {
        dashboardCache.invalidateByTag(tag)
    })

    console.log(`Cache invalidado para tags: ${tagsArray.join(', ')}`)
}

export function clearAllCache() {
    dashboardCache.clear()
    console.log('Todo o cache do dashboard foi limpo')
}

// =================== HOOKS PARA INVALIDAÇÃO ===================

// Função para invalidar cache após operações que afetam os dados
export function invalidateCacheAfterSale() {
    invalidateCache(['sales', 'products', 'customers'])
}

export function invalidateCacheAfterProduct() {
    invalidateCache(['products', 'inventory'])
}

export function invalidateCacheAfterInventory() {
    invalidateCache(['inventory'])
}

export function invalidateCacheAfterCustomer() {
    invalidateCache(['customers'])
}

// =================== MIDDLEWARE DE CACHE PARA ROTAS ===================

export function withCache<T>(
    strategy: keyof typeof CACHE_STRATEGIES
) {
    return function(queryFunction: () => Promise<T>) {
        return async function(params: Record<string, any>, userId?: number) {
            const endpoint = strategy.replace('_', '-')
            const cacheKey = generateCacheKey(endpoint, params, userId)

            return getCachedData(cacheKey, queryFunction, strategy)
        }
    }
}

// =================== VERSÕES CACHADAS DOS SERVIÇOS ===================

import {
    getDashboardOverview as _getDashboardOverview,
    getTopSellingProducts as _getTopSellingProducts,
    getUserPerformanceMetrics as _getUserPerformanceMetrics,
    getCategorySalesMetrics as _getCategorySalesMetrics,
    getLowStockAnalysis as _getLowStockAnalysis
} from '@/lib/services/dashboard'

// Dashboard Overview com cache
export const getCachedDashboardOverview = withCache('dashboard_overview')(
    async (params: any) => {
        return _getDashboardOverview(
            params.period,
            params.dateFrom,
            params.dateTo,
            params.userId,
            params.includeComparison
        )
    }
)

// Top produtos com cache
export const getCachedTopProducts = withCache('top_products')(
    async (params: any) => {
        return _getTopSellingProducts(
            params.period,
            params.limit,
            params.categoryId,
            params.dateFrom,
            params.dateTo
        )
    }
)

// Performance de usuários com cache
export const getCachedUserPerformance = withCache('user_performance')(
    async (params: any) => {
        return _getUserPerformanceMetrics(
            params.period,
            params.dateFrom,
            params.dateTo,
            params.userId
        )
    }
)

// Métricas de categoria com cache
export const getCachedCategoryMetrics = withCache('category_metrics')(
    async (params: any) => {
        return _getCategorySalesMetrics(
            params.period,
            params.dateFrom,
            params.dateTo,
            params.categoryId
        )
    }
)

// Análise de estoque com cache
export const getCachedInventoryAnalysis = withCache('inventory_analysis')(
    async (params: any) => {
        return _getLowStockAnalysis(
            params.urgencyLevel,
            params.categoryId,
            params.limit
        )
    }
)

// =================== ESTATÍSTICAS DO CACHE ===================

export function getCacheStats() {
    return {
        size: dashboardCache.size(),
        strategies: Object.keys(CACHE_STRATEGIES),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    }
}

// =================== CONFIGURAÇÕES AVANÇADAS ===================

export interface CacheConfig {
    enabled: boolean
    defaultTTL: number
    maxSize: number
    cleanupInterval: number
}

export const cacheConfig: CacheConfig = {
    enabled: process.env.NODE_ENV === 'production',
    defaultTTL: 300, // 5 minutos
    maxSize: 1000, // máximo de 1000 entradas
    cleanupInterval: 300000 // limpeza a cada 5 minutos
}

// =================== HEALTH CHECK DO CACHE ===================

export async function cacheHealthCheck() {
    try {
        const testKey = 'health-check'
        const testData = { timestamp: Date.now() }

        // Teste de escrita
        dashboardCache.set(testKey, testData, 10)

        // Teste de leitura
        const retrieved = dashboardCache.get(testKey)
        const isHealthy = retrieved && retrieved.timestamp === testData.timestamp

        // Limpeza
        dashboardCache.delete(testKey)

        return {
            healthy: isHealthy,
            stats: getCacheStats(),
            config: cacheConfig
        }
    } catch (error) {
        return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            stats: getCacheStats(),
            config: cacheConfig
        }
    }
}

// =================== UTILITÁRIOS DE DESENVOLVIMENTO ===================

export function debugCache() {
    if (process.env.NODE_ENV === 'development') {
        console.log('=== DEBUG CACHE ===')
        console.log('Tamanho do cache:', dashboardCache.size())
        console.log('Estratégias:', Object.keys(CACHE_STRATEGIES))
        console.log('Configuração:', cacheConfig)
        console.log('==================')
    }
}

// Para usar nos testes
export function getCacheInstance() {
    return dashboardCache
}