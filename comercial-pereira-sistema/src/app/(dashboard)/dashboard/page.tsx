// app/(dashboard)/dashboard/page.tsx
'use client'

import React, { useState } from 'react'
import {
    TrendingUp, DollarSign, Users, Package, ShoppingCart,
    Target, AlertTriangle, RefreshCw, Calendar
} from 'lucide-react'


import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard'
import { DashboardPromoCard } from '@/components/dashboard/DashboardPromoCard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { ProductPopularTable } from '@/components/dashboard/ProductPopularTable'
import { SalesTargetBar } from '@/components/dashboard/SalesTargetBar'
import { GeographicMapBrazil } from '@/components/dashboard/GeographicMapBrazil'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import {useDashboard} from "@/lib/hooks/useDashboard";

// =================== COMPONENTE PRINCIPAL ===================

export default function DashboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedUser, setSelectedUser] = useState<number | undefined>()
    const [showPromoCard, setShowPromoCard] = useState(true)
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Hook principal da dashboard
    const {
        overview,
        topProducts,
        userPerformance,
        inventoryAlerts,
        salesChartData,
        categoryChartData,
        loading,
        error,
        loadingStates,
        metadata,
        refresh,
        updateFilters,
        setPeriod
    } = useDashboard({
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutos
        initialFilters: {
            period: selectedPeriod,
            userId: selectedUser,
            includeComparison: true,
            includeGrowth: true,
            includeTrends: true
        }
    })

    // =================== HANDLERS ===================

    const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'year') => {
        const mappedPeriod = period === 'day' ? 'today' : period
        setSelectedPeriod(mappedPeriod as any)
        setPeriod(mappedPeriod as any)
    }

    const handleUserChange = (userId: number | undefined) => {
        setSelectedUser(userId)
        updateFilters({ userId })
    }

    const handleProductClick = (productId: number) => {
        console.log('Navegando para produto:', productId)
        // Implementar navegação para produto
    }

    const handleExportSalesChart = () => {
        console.log('Exportando dados do gráfico de vendas')
        // Implementar exportação
    }

    const handleRefresh = async () => {
        await refresh()
    }

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    const handleNavigation = (href: string) => {
        console.log('Navegando para:', href)
        // Implementar navegação
    }

    const handleSearch = (query: string) => {
        console.log('Buscando:', query)
        // Implementar busca
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    // Converter dados para o formato esperado pelos componentes
    const salesByState = categoryChartData.map((category, index) => ({
        state: category.categoryName,
        value: Number(category.revenue),
        percentage: category.percentage
    }))

    // =================== RENDER PRINCIPAL ===================

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={toggleSidebar}
                    activeItem="/dashboard"
                    onItemClick={handleNavigation}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <Header
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' }
                        ]}
                        onSearch={handleSearch}
                        searchPlaceholder="Buscar produtos, clientes, vendas..."
                        notificationCount={inventoryAlerts.length}
                        onToggleSidebar={toggleSidebar}
                        isDarkMode={isDarkMode}
                        onToggleDarkMode={toggleDarkMode}
                        showQuickCart={true}
                        cartItemCount={0}
                    />

                    {/* Dashboard Content */}
                    <main className="flex-1 overflow-auto">
                        <div className="max-w-7xl mx-auto p-6 space-y-8">
                            {/* Header Section */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Dashboard Comercial
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                                        Acompanhe o desempenho da sua empresa em tempo real
                                    </p>
                                    {metadata.lastUpdate && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Última atualização: {metadata.lastUpdate.toLocaleString('pt-BR')}
                                            {metadata.cached && ' (cache)'}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Botão de Refresh */}
                                    <button
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        Atualizar
                                    </button>
                                </div>
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Promo Card */}
                            {showPromoCard && (
                                <DashboardPromoCard
                                    title="🎉 Bem-vindo ao seu Dashboard!"
                                    description="Acompanhe suas vendas, estoque e performance em tempo real. Explore os recursos disponíveis para maximizar seus resultados."
                                    ctaText="Explorar Recursos"
                                    onCtaClick={() => console.log('Explorando recursos')}
                                    onDismiss={() => setShowPromoCard(false)}
                                    gradient="from-blue-600 to-purple-700"
                                />
                            )}

                            {/* Métricas Principais */}
                            {overview && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <DashboardMetricCard
                                        label="Vendas Hoje"
                                        value={overview.salesMetrics.today.count}
                                        change={undefined}
                                        trend="UP"
                                        icon={ShoppingCart}
                                        color="text-blue-600"
                                        bgColor="bg-blue-100"
                                        borderColor="border-blue-200"
                                        loading={loadingStates.overview}
                                        period="vs. ontem"
                                    />

                                    <DashboardMetricCard
                                        label="Faturamento Mensal"
                                        value={`R$ ${Number(overview.salesMetrics.month.total).toLocaleString('pt-BR')}`}
                                        change={overview.salesMetrics.month.growth}
                                        trend={overview.salesMetrics.month.growth > 0 ? "UP" : "DOWN"}
                                        icon={DollarSign}
                                        color="text-green-600"
                                        bgColor="bg-green-100"
                                        borderColor="border-green-200"
                                        loading={loadingStates.overview}
                                        period="vs. mês anterior"
                                    />

                                    <DashboardMetricCard
                                        label="Clientes Ativos"
                                        value={overview.customerMetrics.totalCustomers}
                                        change={overview.customerMetrics.newCustomersThisMonth}
                                        trend="UP"
                                        icon={Users}
                                        color="text-purple-600"
                                        bgColor="bg-purple-100"
                                        borderColor="border-purple-200"
                                        loading={loadingStates.overview}
                                        period="novos este mês"
                                    />

                                    <DashboardMetricCard
                                        label="Produtos em Alerta"
                                        value={overview.productMetrics.lowStockCount + overview.productMetrics.outOfStockCount}
                                        change={undefined}
                                        trend="STABLE"
                                        icon={AlertTriangle}
                                        color="text-orange-600"
                                        bgColor="bg-orange-100"
                                        borderColor="border-orange-200"
                                        loading={loadingStates.overview}
                                        period="estoque baixo/zerado"
                                    />
                                </div>
                            )}

                            {/* Grid Principal */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Coluna Esquerda - 2/3 */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Gráfico de Vendas */}
                                    <SalesChart
                                        data={salesChartData}
                                        period={selectedPeriod === 'today' ? 'day' : selectedPeriod === 'quarter' ? 'month' : selectedPeriod}
                                        onPeriodChange={handlePeriodChange}
                                        loading={loadingStates.charts}
                                        showPreviousPeriod={true}
                                        onExport={handleExportSalesChart}
                                    />

                                    {/* Tabela de Produtos Populares */}
                                    <ProductPopularTable
                                        products={topProducts.map(product => ({
                                            ...product,
                                            totalRevenue: Number(product.totalRevenue),
                                            lastSaleDate: product.lastSaleDate || new Date()
                                        }))}
                                        loading={loadingStates.topProducts}
                                        onProductClick={handleProductClick}
                                    />
                                </div>

                                {/* Coluna Direita - 1/3 */}
                                <div className="space-y-8">
                                    {/* Meta de Vendas */}
                                    {overview && (
                                        <SalesTargetBar
                                            current={Number(overview.salesMetrics.month.total)}
                                            target={Number(overview.salesMetrics.month.total) * 1.2}
                                            label="Meta Mensal"
                                            period="Mês atual"
                                            loading={loadingStates.overview}
                                        />
                                    )}

                                    {/* Mapa Geográfico */}
                                    <GeographicMapBrazil
                                        salesByState={salesByState}
                                        loading={loadingStates.categoryMetrics}
                                    />
                                </div>
                            </div>

                            {/* Seção de Performance de Usuários */}
                            {userPerformance.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                <Target className="w-5 h-5 mr-2 text-blue-600" />
                                                Performance por Vendedor
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Ranking dos vendedores no período
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {userPerformance.slice(0, 6).map((user, index) => (
                                            <div
                                                key={user.userId}
                                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                        index === 0 ? 'bg-yellow-500' :
                                                            index === 1 ? 'bg-gray-400' :
                                                                index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {user.userName}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.salesCount} vendas
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            R$ {Number(user.totalRevenue).toLocaleString('pt-BR')}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.topCategory}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alertas de Estoque */}
                            {inventoryAlerts.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                                Alertas de Estoque
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Produtos que precisam de atenção
                                            </p>
                                        </div>
                                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                            Ver todos
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {inventoryAlerts.slice(0, 5).map((alert) => (
                                            <div
                                                key={alert.productId}
                                                className={`p-4 rounded-lg border-l-4 ${
                                                    alert.urgencyLevel === 'CRITICAL'
                                                        ? 'bg-red-50 border-red-500'
                                                        : alert.urgencyLevel === 'HIGH'
                                                            ? 'bg-orange-50 border-orange-500'
                                                            : 'bg-yellow-50 border-yellow-500'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {alert.productName}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            Código: {alert.productCode} • {alert.categoryName}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Estoque atual: <span className="font-semibold">{alert.currentStock}</span>
                                                            {alert.daysUntilOutOfStock < 999 && (
                                                                <span className="ml-2">
                                                                    • {alert.daysUntilOutOfStock} dias restantes
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        alert.urgencyLevel === 'CRITICAL'
                                                            ? 'bg-red-100 text-red-800'
                                                            : alert.urgencyLevel === 'HIGH'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {alert.urgencyLevel === 'CRITICAL' ? 'Crítico' :
                                                            alert.urgencyLevel === 'HIGH' ? 'Alto' : 'Médio'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}