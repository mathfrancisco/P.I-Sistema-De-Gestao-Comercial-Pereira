"use client";

import React, { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    DollarSign, Package, Users, ShoppingCart, AlertCircle,
    Calendar, RefreshCw, Activity, Zap, BarChart3,
} from "lucide-react";
import { DashboardPromoCard } from "@/components/dashboard/DashboardPromoCard";
import { GeographicMapBrazil } from "@/components/dashboard/GeographicMapBrazil";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { SalesTargetBar } from "@/components/dashboard/SalesTargetBar";
import { ProductPopularTable } from "@/components/dashboard/ProductPopularTable";
import { useDashboard, useDashboardFilters } from "@/hooks/useDashboard";

// ============================================
// COMPONENTE PRINCIPAL - DASHBOARD
// ============================================
export default function DashboardPage() {
    const { data: session } = useSession();

    // Estados para controle de filtros
    const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month" | "year">("week");

    // Hook de filtros
    const { filters, updateFilter } = useDashboardFilters({
        period: 'month',
        includeComparison: true,
        limit: 10
    });

    // Hook principal da dashboard
    const {
        // Dados
        overview,
        topProducts,
        salesChart,
        inventoryAlerts,

        // Estados de loading
        loading,
        isRefreshing,
        hasAnyError,
        errors,
        lastUpdated,

        // Funções
        refresh,
        refreshSection,
        clearErrors,
        fetchSalesChart,
        hasPermission,
        getLoadingStatus
    } = useDashboard(filters, true);

    // ============================================
    // HANDLERS
    // ============================================

    const handleRefresh = useCallback(async () => {
        if (hasAnyError) {
            clearErrors();
        }
        await refresh();
    }, [refresh, hasAnyError, clearErrors]);

    const handlePeriodChange = useCallback((newPeriod: typeof filters.period) => {
        updateFilter('period', newPeriod);
    }, [updateFilter]);

    const handleChartPeriodChange = useCallback((newPeriod: typeof chartPeriod) => {
        setChartPeriod(newPeriod);
        // Refetch chart data with new period
        fetchSalesChart({ period: newPeriod });
    }, [fetchSalesChart]);

    const handleExportChart = useCallback(() => {
        console.log('Exportando dados do gráfico...', { salesChart, period: chartPeriod });
        // Implementar exportação real aqui
    }, [salesChart, chartPeriod]);

    const handleProductClick = useCallback((productId: number) => {
        console.log(`Navegando para produto ${productId}`);
        // Implementar navegação para produto
    }, []);

    const handlePromoClick = useCallback(() => {
        console.log('Promo clicked - opening insights page');
        // Navegar para insights
    }, []);

    const handlePromoDismiss = useCallback(() => {
        console.log('Promo dismissed');
        // Salvar preferência de dismissal
    }, []);

    const handleStockReportClick = useCallback(() => {
        console.log('Navegando para relatório de estoque');
        // Implementar navegação
    }, []);

    // ============================================
    // VERIFICAÇÕES DE PERMISSÃO
    // ============================================

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!hasPermission('dashboard:read')) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
                    <p className="text-gray-600">Você não tem permissão para visualizar o dashboard.</p>
                </div>
            </div>
        );
    }

    // ============================================
    // DADOS COMPUTADOS
    // ============================================

    const metricsData = overview ? {
        totalRevenue: Number(overview.salesMetrics.month.total),
        revenueGrowth: overview.salesMetrics.month.growth,
        totalOrders: overview.salesMetrics.month.count,
        ordersGrowth: 12, // Pode ser calculado dos dados da API
        totalCustomers: overview.customerMetrics.totalCustomers,
        customersGrowth: overview.customerMetrics.newCustomersThisMonth > 0 ? 15 : -5,
        totalProducts: overview.productMetrics.totalProducts,
        productsGrowth: overview.productMetrics.outOfStockCount > 0 ? -2 : 5,
        salesTarget: 500000, // Pode vir da API
        currentSales: Number(overview.salesMetrics.month.total),
        ticketMedio: Number(overview.salesMetrics.month.average)
    } : null;

    const loadingStatus = getLoadingStatus();

    // Dados geográficos mock (até implementar API)
    const salesByState = [
        { state: 'SP', value: 45, percentage: 45 },
        { state: 'RJ', value: 25, percentage: 25 },
        { state: 'MG', value: 15, percentage: 15 },
        { state: 'RS', value: 10, percentage: 10 },
        { state: 'PR', value: 5, percentage: 5 }
    ];

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Header da Dashboard */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                            Dashboard Executivo
                        </h1>
                        <p className="text-gray-600 mt-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            {lastUpdated && (
                                <span className="ml-4 text-sm text-gray-500">
                                    Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Indicador de loading geral */}
                        {loadingStatus.percentage < 100 && (
                            <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                <span className="text-sm">
                                    Carregando... {loadingStatus.percentage}%
                                </span>
                            </div>
                        )}

                        {/* Indicador de erro */}
                        {hasAnyError && (
                            <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="text-sm">Alguns dados falharam</span>
                            </div>
                        )}

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                        </button>

                        <select
                            value={filters.period}
                            onChange={(e) => handlePeriodChange(e.target.value as typeof filters.period)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="today">Hoje</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="year">Este Ano</option>
                        </select>
                    </div>
                </div>

                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardMetricCard
                        label="Receita Total"
                        value={metricsData ? `R$ ${metricsData.totalRevenue.toLocaleString("pt-BR")}` : '-'}
                        change={metricsData?.revenueGrowth}
                        trend={metricsData && metricsData.revenueGrowth > 0 ? "UP" : "DOWN"}
                        icon={DollarSign}
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                        borderColor="border-blue-200"
                        loading={loading.overview}
                        period="vs período anterior"
                        error={errors.overview}
                        onRetry={() => refreshSection('overview')}
                    />

                    <DashboardMetricCard
                        label="Total de Pedidos"
                        value={metricsData?.totalOrders || '-'}
                        change={metricsData?.ordersGrowth}
                        trend={metricsData && metricsData.ordersGrowth > 0 ? "UP" : "DOWN"}
                        icon={ShoppingCart}
                        color="text-green-600"
                        bgColor="bg-green-100"
                        borderColor="border-green-200"
                        loading={loading.overview}
                        period="vs período anterior"
                        error={errors.overview}
                        onRetry={() => refreshSection('overview')}
                    />

                    <DashboardMetricCard
                        label="Total de Clientes"
                        value={metricsData?.totalCustomers || '-'}
                        change={metricsData?.customersGrowth}
                        trend={metricsData && metricsData.customersGrowth > 0 ? "UP" : "DOWN"}
                        icon={Users}
                        color="text-purple-600"
                        bgColor="bg-purple-100"
                        borderColor="border-purple-200"
                        loading={loading.overview}
                        period="vs período anterior"
                        error={errors.overview}
                        onRetry={() => refreshSection('overview')}
                    />

                    <DashboardMetricCard
                        label="Total de Produtos"
                        value={metricsData?.totalProducts || '-'}
                        change={metricsData?.productsGrowth}
                        trend={metricsData && metricsData.productsGrowth > 0 ? "UP" : "DOWN"}
                        icon={Package}
                        color="text-orange-600"
                        bgColor="bg-orange-100"
                        borderColor="border-orange-200"
                        loading={loading.overview}
                        period="vs período anterior"
                        error={errors.overview}
                        onRetry={() => refreshSection('overview')}
                    />
                </div>

                {/* Gráfico de Vendas e Meta */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SalesChart
                            data={salesChart}
                            period={chartPeriod}
                            onPeriodChange={handleChartPeriodChange}
                            loading={loading.salesChart}
                            showPreviousPeriod={true}
                            onExport={handleExportChart}
                            error={errors.salesChart}
                            onRetry={() => refreshSection('salesChart')}
                        />
                    </div>

                    <div className="space-y-6">
                        <SalesTargetBar
                            current={metricsData?.currentSales || 0}
                            target={metricsData?.salesTarget || 500000}
                            label="Meta de Vendas"
                            period="Mensal"
                            loading={loading.overview}
                        />

                        {/* Resumo Executivo */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                                Resumo Executivo
                            </h3>

                            {loading.overview ? (
                                <div className="space-y-4">
                                    <div className="animate-pulse space-y-2">
                                        <div className="bg-gray-200 rounded h-4 w-full"></div>
                                        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                                        <div className="bg-gray-200 rounded h-4 w-1/2"></div>
                                    </div>
                                </div>
                            ) : errors.overview ? (
                                <div className="text-center py-4">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-600 text-sm">Erro ao carregar resumo</p>
                                    <button
                                        onClick={() => refreshSection('overview')}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : overview ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ticket Médio</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            R$ {metricsData?.ticketMedio.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Produtos em Falta</span>
                                        <span className="text-sm font-semibold text-red-600">
                                            {overview.productMetrics.outOfStockCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Estoque Baixo</span>
                                        <span className="text-sm font-semibold text-yellow-600">
                                            {overview.productMetrics.lowStockCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Novos Clientes</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {overview.customerMetrics.newCustomersThisMonth}
                                        </span>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Status Geral</span>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                <span className="font-medium text-green-600">
                                                    {overview.productMetrics.outOfStockCount === 0 ? 'Excelente' : 'Atenção'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">Dados não disponíveis</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Produtos Populares e Mapa Geográfico */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProductPopularTable
                        products={topProducts}
                        loading={loading.products}
                        onProductClick={handleProductClick}
                        error={errors.products}
                        onRetry={() => refreshSection('products')}
                    />

                    <GeographicMapBrazil
                        salesByState={salesByState}
                        loading={false} // Mock data
                    />
                </div>

                {/* Card Promocional */}
                <DashboardPromoCard
                    title="Impulsione suas vendas com Insights Avançados"
                    description="Descubra padrões de comportamento, identifique oportunidades de cross-sell e otimize sua estratégia comercial com nossa nova suite de analytics."
                    ctaText="Explorar Insights"
                    onCtaClick={handlePromoClick}
                    onDismiss={handlePromoDismiss}
                    gradient="from-indigo-600 via-purple-600 to-blue-600"
                    icon={Zap}
                />

                {/* Seção de Alertas - Apenas se houver dados */}
                {overview && (overview.productMetrics.outOfStockCount > 0 || overview.productMetrics.lowStockCount > 0) && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">
                                    Atenção: Alertas de Estoque
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {overview.productMetrics.outOfStockCount > 0 && (
                                        <div className="flex items-center text-red-700">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                            <span>
                                                <strong>{overview.productMetrics.outOfStockCount}</strong> produtos em falta
                                            </span>
                                        </div>
                                    )}
                                    {overview.productMetrics.lowStockCount > 0 && (
                                        <div className="flex items-center text-orange-700">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                            <span>
                                                <strong>{overview.productMetrics.lowStockCount}</strong> produtos com estoque baixo
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleStockReportClick}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Ver Relatório de Estoque
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado de erro global */}
                {hasAnyError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                                    Alguns dados não puderam ser carregados
                                </h3>
                                <p className="text-yellow-700 text-sm">
                                    Verifique sua conexão e tente atualizar os dados.
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}