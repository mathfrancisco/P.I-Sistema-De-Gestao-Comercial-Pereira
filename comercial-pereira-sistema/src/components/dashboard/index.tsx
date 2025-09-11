import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    TrendingUp,
    TrendingDown,
    Package,
    Users,
    ShoppingCart,
    AlertTriangle,
    DollarSign,
    BarChart3,
    Clock
} from 'lucide-react'

// =================== INTERFACES ===================

interface DashboardMetrics {
    salesMetrics: {
        today: { count: number; total: number; average: number; growth: number }
        month: { count: number; total: number; average: number; growth: number }
        year: { count: number; total: number; average: number; growth: number }
    }
    productMetrics: {
        totalProducts: number
        lowStockCount: number
        outOfStockCount: number
        topSellingToday: ProductMetric[]
    }
    customerMetrics: {
        totalCustomers: number
        newCustomersThisMonth: number
        topCustomers: CustomerMetric[]
    }
    performanceMetrics: {
        salesByUser: UserMetric[]
        salesByCategory: CategoryMetric[]
        conversionRate: number
    }
}

interface ProductMetric {
    productId: number
    productName: string
    productCode: string
    categoryName: string
    totalQuantitySold: number
    totalRevenue: number
    salesCount: number
}

interface UserMetric {
    userId: number
    userName: string
    userRole: string
    salesCount: number
    totalRevenue: number
    averageOrderValue: number
    topCategory: string
    efficiency: number
}

interface CategoryMetric {
    categoryId: number
    categoryName: string
    salesCount: number
    totalRevenue: number
    marketShare: number
}

interface CustomerMetric {
    customerId: number
    customerName: string
    customerType: string
    totalPurchases: number
    purchaseCount: number
    averageOrderValue: number
}

interface Alert {
    id: string
    type: string
    priority: string
    title: string
    message: string
}

// =================== COMPONENTE PRINCIPAL ===================

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPeriod, setSelectedPeriod] = useState('month')

    // =================== EFEITOS ===================

    useEffect(() => {
        loadDashboardData()
        loadAlerts()

        // Recarregar dados a cada 5 minutos
        const interval = setInterval(() => {
            loadDashboardData()
            loadAlerts()
        }, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [selectedPeriod])

    // =================== FUNÇÕES DE API ===================

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                period: selectedPeriod,
                includeComparison: 'true',
                includeGrowth: 'true'
            })

            const response = await fetch(`/api/dashboard/overview?${params}`)

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            setMetrics(result.data)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
            console.error('Erro no dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/dashboard/alerts?limit=5')
            if (response.ok) {
                const result = await response.json()
                setAlerts(result.data)
            }
        } catch (err) {
            console.error('Erro ao carregar alertas:', err)
        }
    }

    // =================== FUNÇÕES UTILITÁRIAS ===================

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value)
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`
    }

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
        if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
        return <div className="h-4 w-4" />
    }

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600'
        if (growth < 0) return 'text-red-600'
        return 'text-gray-500'
    }

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'LOW_STOCK':
            case 'OUT_OF_STOCK':
                return <Package className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    const getAlertColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
            case 'CRITICAL':
                return 'border-red-200 bg-red-50'
            case 'MEDIUM':
                return 'border-yellow-200 bg-yellow-50'
            default:
                return 'border-blue-200 bg-blue-50'
        }
    }

    // =================== COMPONENTES DE CARD ===================

    const MetricCard = ({
                            title,
                            value,
                            subtitle,
                            growth,
                            icon: Icon,
                            formatter = formatNumber
                        }: {
        title: string
        value: number
        subtitle?: string
        growth?: number
        icon: any
        formatter?: (value: number) => string
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatter(value)}</div>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                {growth !== undefined && (
                    <div className={`flex items-center pt-1 ${getGrowthColor(growth)}`}>
                        {getGrowthIcon(growth)}
                        <span className="text-xs ml-1">{formatPercentage(growth)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    // =================== RENDERIZAÇÃO ===================

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-6 w-6 animate-spin" />
                        <span>Carregando dashboard...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Erro ao carregar dashboard:</strong> {error}
                        <button
                            onClick={loadDashboardData}
                            className="ml-2 text-red-600 underline hover:text-red-800"
                        >
                            Tentar novamente
                        </button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!metrics) {
        return (
            <div className="p-6">
                <Alert>
                    <AlertDescription>Nenhum dado disponível</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header com filtros */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard Comercial Pereira</h1>

                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                >
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="quarter">Este Trimestre</option>
                    <option value="year">Este Ano</option>
                </select>
            </div>

            {/* Alertas */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Alertas</h2>
                    {alerts.map(alert => (
                        <Alert key={alert.id} className={getAlertColor(alert.priority)}>
                            <div className="flex items-center space-x-2">
                                {getAlertIcon(alert.type)}
                                <div>
                                    <div className="font-medium">{alert.title}</div>
                                    <div className="text-sm">{alert.message}</div>
                                </div>
                            </div>
                        </Alert>
                    ))}
                </div>
            )}

            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Vendas Hoje"
                    value={metrics.salesMetrics.today.count}
                    subtitle={formatCurrency(metrics.salesMetrics.today.total)}
                    growth={metrics.salesMetrics.today.growth}
                    icon={ShoppingCart}
                />

                <MetricCard
                    title="Faturamento Mensal"
                    value={metrics.salesMetrics.month.total}
                    subtitle={`${metrics.salesMetrics.month.count} vendas`}
                    growth={metrics.salesMetrics.month.growth}
                    icon={DollarSign}
                    formatter={formatCurrency}
                />

                <MetricCard
                    title="Produtos Ativos"
                    value={metrics.productMetrics.totalProducts}
                    subtitle={`${metrics.productMetrics.lowStockCount} com estoque baixo`}
                    icon={Package}
                />

                <MetricCard
                    title="Clientes Ativos"
                    value={metrics.customerMetrics.totalCustomers}
                    subtitle={`${metrics.customerMetrics.newCustomersThisMonth} novos este mês`}
                    icon={Users}
                />
            </div>

            {/* Top Produtos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Produtos Mais Vendidos Hoje</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.productMetrics.topSellingToday.slice(0, 5).map((product, index) => (
                            <div key={product.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{product.productName}</div>
                                        <div className="text-sm text-gray-500">{product.categoryName}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(product.totalRevenue)}</div>
                                    <div className="text-sm text-gray-500">{product.totalQuantitySold} unidades</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance por Vendedor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Performance dos Vendedores</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.performanceMetrics.salesByUser.slice(0, 5).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.userName}</div>
                                        <div className="text-sm text-gray-500">{user.userRole}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(user.totalRevenue)}</div>
                                    <div className="text-sm text-gray-500">{user.salesCount} vendas</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Faturamento por Categoria */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Faturamento por Categoria</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.performanceMetrics.salesByCategory.slice(0, 5).map((category, index) => (
                            <div key={category.categoryId} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{category.categoryName}</span>
                                    <span className="text-sm font-medium">{formatCurrency(category.totalRevenue)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${category.marketShare}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{formatPercentage(category.marketShare)} do total</span>
                                    <span>{category.salesCount} vendas</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Footer com informações */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
                Dashboard atualizado automaticamente •
                Taxa de conversão: {formatPercentage(metrics.performanceMetrics.conversionRate)} •
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </div>
        </div>
    )
}