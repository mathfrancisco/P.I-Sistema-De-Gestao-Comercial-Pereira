"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { DashboardPromoCard } from "@/components/dashboard/DashboardPromoCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductPopularTable } from "@/components/dashboard/ProductPopularTable";
import { SalesTargetBar } from "@/components/dashboard/SalesTargetBar";
import { GeographicMapBrazil } from "@/components/dashboard/GeographicMapBrazil";
import {
  DashboardOverview,
  SalesChartData,
  ProductSaleMetric,
} from "@/types/dashboard";
import { toast } from "sonner";

export default function DashboardPage() {
  // Estados para os dados
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSaleMetric[]>([]);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");

  // Estados para vendas por estado (mock data por enquanto)
  const [salesByState] = useState([
    { state: "São Paulo", value: 45000, percentage: 35 },
    { state: "Rio de Janeiro", value: 28000, percentage: 22 },
    { state: "Minas Gerais", value: 20000, percentage: 15 },
    { state: "Paraná", value: 18000, percentage: 14 },
    { state: "Rio Grande do Sul", value: 14000, percentage: 11 },
  ]);

  // Fetch dashboard overview
  const fetchDashboardOverview = async () => {
    try {
      const response = await fetch(`/api/dashboard/overview?period=${period}`);
      if (!response.ok) throw new Error("Erro ao carregar dados");

      const data = await response.json();
      setOverview(data.data);
    } catch (error) {
      console.error("Erro ao buscar overview:", error);
      toast.error("Erro ao carregar dados do dashboard");
    }
  };

  // Fetch sales chart data
  const fetchSalesChart = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/charts/sales?period=${chartPeriod}&granularity=day`
      );
      if (!response.ok) throw new Error("Erro ao carregar gráfico");

      const data = await response.json();
      setSalesChartData(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar gráfico:", error);
      // Usar dados mock se a API falhar
      setSalesChartData([
        { date: "01/01", sales: 42, revenue: 12500, orders: 15 },
        { date: "02/01", sales: 38, revenue: 11200, orders: 12 },
        { date: "03/01", sales: 51, revenue: 15300, orders: 18 },
        { date: "04/01", sales: 47, revenue: 14100, orders: 16 },
        { date: "05/01", sales: 55, revenue: 16500, orders: 20 },
        { date: "06/01", sales: 48, revenue: 14400, orders: 17 },
        { date: "07/01", sales: 62, revenue: 18600, orders: 22 },
      ]);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/products?period=${period}&limit=10`
      );
      if (!response.ok) throw new Error("Erro ao carregar produtos");

      const data = await response.json();
      setTopProducts(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      // Usar dados mock se a API falhar
      setTopProducts([
        {
          productId: 1,
          productName: "Produto A",
          productCode: "PA001",
          categoryName: "Categoria 1",
          totalQuantitySold: 150,
          totalRevenue: 4500 as any,
          salesCount: 45,
          averageQuantityPerSale: 3.3,
          lastSaleDate: new Date(),
          trend: "UP",
        },
        {
          productId: 2,
          productName: "Produto B",
          productCode: "PB002",
          categoryName: "Categoria 2",
          totalQuantitySold: 120,
          totalRevenue: 3600 as any,
          salesCount: 38,
          averageQuantityPerSale: 3.2,
          lastSaleDate: new Date(),
          trend: "DOWN",
        },
        {
          productId: 3,
          productName: "Produto C",
          productCode: "PC003",
          categoryName: "Categoria 1",
          totalQuantitySold: 95,
          totalRevenue: 2850 as any,
          salesCount: 30,
          averageQuantityPerSale: 3.1,
          lastSaleDate: new Date(),
          trend: "STABLE",
        },
      ]);
    }
  };

  // Carregar todos os dados
  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardOverview(),
      fetchSalesChart(),
      fetchTopProducts(),
    ]);
    setLoading(false);
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, [period]);

  // Recarregar gráfico quando mudar período
  useEffect(() => {
    fetchSalesChart();
  }, [chartPeriod]);

  // Handlers
  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
  };

  const handleChartPeriodChange = (newPeriod: typeof chartPeriod) => {
    setChartPeriod(newPeriod);
  };

  const handleExportChart = () => {
    toast.success("Exportando dados do gráfico...");
    // Implementar export real aqui
  };

  const handleProductClick = (productId: number) => {
    // Navegar para página do produto
    window.location.href = `/produtos/${productId}`;
  };

  const handlePromoClick = () => {
    toast.info("Abrindo mais informações...");
  };

  const handlePromoDismiss = () => {
    toast.success("Card promocional removido");
  };

  // Dados mockados ou default quando não há dados da API
  const metricsData = overview
    ? {
        totalRevenue: Number(overview.salesMetrics.month.total),
        revenueGrowth: overview.salesMetrics.month.growth,
        totalOrders: overview.salesMetrics.month.count,
        ordersGrowth: 12,
        totalCustomers: overview.customerMetrics.totalCustomers,
        customersGrowth:
          overview.customerMetrics.newCustomersThisMonth > 0 ? 8 : 0,
        totalProducts: overview.productMetrics.totalProducts,
        productsGrowth: -2,
        salesTarget: 100000,
        currentSales: Number(overview.salesMetrics.month.total),
      }
    : {
        totalRevenue: 81000,
        revenueGrowth: 15,
        totalOrders: 500,
        ordersGrowth: 12,
        totalCustomers: 5000,
        customersGrowth: 8,
        totalProducts: 231,
        productsGrowth: -2,
        salesTarget: 100000,
        currentSales: 81000,
      };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao sistema de gestão Comercial Pereira
          </p>
        </div>

        {/* Seletor de período */}
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) =>
              handlePeriodChange(e.target.value as typeof period)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Hoje</option>
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
          value={`R$ ${metricsData.totalRevenue.toLocaleString("pt-BR")}`}
          change={metricsData.revenueGrowth}
          trend={metricsData.revenueGrowth > 0 ? "UP" : "DOWN"}
          icon={DollarSign}
          color="text-blue-600"
          bgColor="bg-blue-100"
          loading={loading}
          period="vs mês anterior"
        />

        <DashboardMetricCard
          label="Total de Pedidos"
          value={metricsData.totalOrders}
          change={metricsData.ordersGrowth}
          trend={metricsData.ordersGrowth > 0 ? "UP" : "DOWN"}
          icon={ShoppingCart}
          color="text-green-600"
          bgColor="bg-green-100"
          loading={loading}
          period="vs mês anterior"
        />

        <DashboardMetricCard
          label="Total de Clientes"
          value={metricsData.totalCustomers}
          change={metricsData.customersGrowth}
          trend={metricsData.customersGrowth > 0 ? "UP" : "DOWN"}
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-100"
          loading={loading}
          period="vs mês anterior"
        />

        <DashboardMetricCard
          label="Total de Produtos"
          value={metricsData.totalProducts}
          change={metricsData.productsGrowth}
          trend={metricsData.productsGrowth > 0 ? "UP" : "DOWN"}
          icon={Package}
          color="text-orange-600"
          bgColor="bg-orange-100"
          loading={loading}
          period="vs mês anterior"
        />
      </div>

      {/* Linha com Gráfico de Vendas e Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Vendas - ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <SalesChart
            data={salesChartData}
            period={chartPeriod}
            onPeriodChange={handleChartPeriodChange}
            loading={loading}
            showPreviousPeriod={true}
            onExport={handleExportChart}
          />
        </div>

        {/* Meta de Vendas - 1 coluna */}
        <div className="space-y-4">
          <SalesTargetBar
            current={metricsData.currentSales}
            target={metricsData.salesTarget}
            label="Meta de Vendas"
            period="Mensal"
            loading={loading}
          />

          {/* Adicionar cards de resumo */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resumo Rápido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ticket Médio</span>
                <span className="text-sm font-semibold text-gray-900">
                  R${" "}
                  {overview
                    ? Number(overview.salesMetrics.month.average).toFixed(2)
                    : "162,00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Produtos em Falta</span>
                <span className="text-sm font-semibold text-red-600">
                  {overview?.productMetrics.outOfStockCount || 3}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estoque Baixo</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {overview?.productMetrics.lowStockCount || 7}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Populares e Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Produtos Populares */}
        <ProductPopularTable
          products={topProducts}
          loading={loading}
          onProductClick={handleProductClick}
        />

        {/* Mapa Geográfico */}
        <GeographicMapBrazil salesByState={salesByState} loading={loading} />
      </div>

      {/* Card Promocional */}
      <DashboardPromoCard
        title="Aumente suas vendas em 30%"
        description="Descubra insights poderosos sobre seu negócio e tome decisões baseadas em dados reais para impulsionar suas vendas."
        ctaText="Saiba Mais"
        onCtaClick={handlePromoClick}
        onDismiss={handlePromoDismiss}
        gradient="from-blue-600 to-indigo-700"
      />

      {/* Seção de Alertas (opcional) */}
      {(overview?.productMetrics.outOfStockCount ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              Atenção: {overview?.productMetrics.outOfStockCount ?? 0} produtos
              em falta
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Verifique o estoque e faça pedidos de reposição o quanto antes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
