// components/categories/CategoryAnalytics.tsx
'use client'

import { useState, useEffect } from 'react'
import { CategoryResponse, CategorySalesMetric } from '@/types/category'
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Percent,
    Download,
    ArrowUp,
    ArrowDown
} from 'lucide-react'

interface CategoryAnalyticsProps {
    category: CategoryResponse
    onExportReport?: () => void
}

interface MetricCardProps {
    title: string
    value: string
    change?: number
    changeType?: 'increase' | 'decrease'
    icon: React.ComponentType<any>
    color: string
}

const MetricCard: React.FC<MetricCardProps> = ({
                                                   title,
                                                   value,
                                                   change,
                                                   changeType,
                                                   icon: Icon,
                                                   color
                                               }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {changeType === 'increase' ? (
                        <ArrowUp className="w-4 h-4" />
                    ) : (
                        <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(change)}%
                </div>
            )}
        </div>

        <div className="mt-3">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    </div>
)

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
                                                                        category,
                                                                        onExportReport
                                                                    }) => {
    const [salesData, setSalesData] = useState<CategorySalesMetric | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

    // Dados mockados para demonstração
    const mockSalesData: CategorySalesMetric = {
        categoryId: category.id,
        categoryName: category.name,
        cnae: category.cnae || '',
        salesCount: 156,
        totalRevenue: 45890.75,
        totalQuantitySold: 234,
        averageOrderValue: 294.81,
        marketShare: 12.5,
        growth: 8.3,
        topProducts: [
            { id: 1, name: 'Produto A', code: 'PA001', totalSales: 45, revenue: 13467.00 },
            { id: 2, name: 'Produto B', code: 'PB002', totalSales: 38, revenue: 11234.50 },
            { id: 3, name: 'Produto C', code: 'PC003', totalSales: 29, revenue: 8690.25 },
            { id: 4, name: 'Produto D', code: 'PD004', totalSales: 22, revenue: 6588.00 },
            { id: 5, name: 'Produto E', code: 'PE005', totalSales: 18, revenue: 5391.00 }
        ]
    }

    // Dados para gráfico de participação
    const marketShareData = [
        { name: category.name, value: mockSalesData.marketShare, color: '#3B82F6' },
        { name: 'Outras categorias', value: 100 - mockSalesData.marketShare, color: '#E5E7EB' }
    ]

    // Dados para evolução temporal (últimos 6 meses)
    const timeSeriesData = [
        { month: 'Jan', vendas: 32, receita: 9600 },
        { month: 'Fev', vendas: 28, receita: 8400 },
        { month: 'Mar', vendas: 41, receita: 12300 },
        { month: 'Abr', vendas: 38, receita: 11400 },
        { month: 'Mai', vendas: 45, receita: 13500 },
        { month: 'Jun', vendas: 52, receita: 15600 }
    ]

    // Dados de comparação com outras categorias
    const categoryComparison = [
        { name: 'Eletrônicos', receita: 65000, marketShare: 18.2 },
        { name: 'Casa e Jardim', receita: 58000, marketShare: 16.1 },
        { name: category.name, receita: mockSalesData.totalRevenue, marketShare: mockSalesData.marketShare },
        { name: 'Ferramentas', receita: 42000, marketShare: 11.8 },
        { name: 'Automotivo', receita: 38000, marketShare: 10.6 }
    ].sort((a, b) => b.receita - a.receita)

    useEffect(() => {
        // Simular carregamento de dados
        const timer = setTimeout(() => {
            setSalesData(mockSalesData)
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [period])

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!salesData) return null

    return (
        <div className="space-y-6">
            {/* Header com controles */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Analytics - {category.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Performance e insights da categoria
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Selector de período */}
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                        <option value="1y">Último ano</option>
                    </select>

                    {/* Botão de export */}
                    {onExportReport && (
                        <button
                            onClick={onExportReport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Receita Total"
                    value={`R$ ${salesData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change={salesData.growth}
                    changeType="increase"
                    icon={DollarSign}
                    color="bg-green-500"
                />

                <MetricCard
                    title="Vendas"
                    value={salesData.salesCount.toString()}
                    change={5.2}
                    changeType="increase"
                    icon={ShoppingCart}
                    color="bg-blue-500"
                />

                <MetricCard
                    title="Ticket Médio"
                    value={`R$ ${salesData.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change={2.1}
                    changeType="increase"
                    icon={TrendingUp}
                    color="bg-purple-500"
                />

                <MetricCard
                    title="Market Share"
                    value={`${salesData.marketShare}%`}
                    change={0.8}
                    changeType="increase"
                    icon={Percent}
                    color="bg-orange-500"
                />
            </div>

            {/* Gráficos principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participação nas vendas */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Participação nas Vendas Totais
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={marketShareData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {marketShareData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 10 produtos */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top 5 Produtos por Receita
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData.topProducts} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip
                                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                                />
                                <Bar dataKey="revenue" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Evolução temporal */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Evolução de Vendas
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="vendas"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    name="Número de Vendas"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="receita"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Receita (R$)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Comparativo com outras categorias */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Comparativo com Outras Categorias
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'receita'
                                            ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : `${value}%`,
                                        name === 'receita' ? 'Receita' : 'Market Share'
                                    ]}
                                />
                                <Bar dataKey="receita">
                                    {categoryComparison.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === category.name ? '#3B82F6' : '#E5E7EB'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights e recomendações */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Insights e Recomendações
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">🎯 Performance</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Crescimento de {salesData.growth}% no período</li>
                            <li>• Market share de {salesData.marketShare}% do total</li>
                            <li>• {salesData.topProducts.length} produtos gerando 80% da receita</li>
                            <li>• Ticket médio acima da média geral</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">💡 Oportunidades</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Expandir linha dos produtos top performers</li>
                            <li>• Otimizar estoque dos produtos de menor giro</li>
                            <li>• Implementar cross-selling entre produtos</li>
                            <li>• Aumentar margem dos produtos de alta demanda</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}