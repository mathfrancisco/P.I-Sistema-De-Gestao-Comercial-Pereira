import React, {useState} from "react";
import {Skeleton} from "@/components/ui/loading";
import {Activity, Download} from "lucide-react";

interface SalesChartData {
    date: string;
    sales: number;
    revenue: number;
    orders: number;
}

interface SalesChartProps {
    data: SalesChartData[];
    period: 'day' | 'week' | 'month' | 'year';
    onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
    loading?: boolean;
    showPreviousPeriod?: boolean;
    onExport?: () => void;
}

export const SalesChart: React.FC<SalesChartProps> = ({
                                                                  data,
                                                                  period,
                                                                  onPeriodChange,
                                                                  loading = false,
                                                                  showPreviousPeriod = true,
                                                                  onExport
                                                              }) => {
    const [showCurrentPeriod, setShowCurrentPeriod] = useState(true);
    const [showPreviousPeriodState, setShowPreviousPeriodState] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const periods = [
        { value: 'day', label: 'Dia' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' }
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-96">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton width="200px" height="1.5rem" />
                    <Skeleton width="300px" height="2rem" />
                </div>
                <Skeleton height="300px" />
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageRevenue = totalRevenue / data.length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Vendas por Período
                    </h3>
                    <p className="text-sm text-gray-500">Vendas vs período anterior</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Period Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {periods.map(p => (
                            <button
                                key={p.value}
                                onClick={() => onPeriodChange(p.value as any)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    period === p.value
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                        </button>
                    )}
                </div>
            </div>

            {/* Interactive Legend */}
            <div className="flex items-center space-x-6 mb-6">
                <button
                    onClick={() => setShowCurrentPeriod(!showCurrentPeriod)}
                    className={`flex items-center space-x-2 text-sm font-medium transition-all ${
                        showCurrentPeriod ? 'opacity-100' : 'opacity-50'
                    }`}
                >
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                    <span>Período Atual</span>
                </button>

                {showPreviousPeriod && (
                    <button
                        onClick={() => setShowPreviousPeriodState(!showPreviousPeriodState)}
                        className={`flex items-center space-x-2 text-sm font-medium transition-all ${
                            showPreviousPeriodState ? 'opacity-100' : 'opacity-50'
                        }`}
                    >
                        <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                        <span>Período Anterior</span>
                    </button>
                )}
            </div>

            {/* Chart Area */}
            <div className="relative h-64 mb-6">
                <div className="h-full flex items-end space-x-1 border-b border-gray-200 pb-4">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="flex-1 flex flex-col items-center relative group"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Tooltip */}
                            {hoveredIndex === index && (
                                <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-20">
                                    <div className="text-center">
                                        <p className="font-semibold text-white">{item.date}</p>
                                        <p className="text-gray-300">Receita: R$ {new Intl.NumberFormat('pt-BR').format(item.revenue)}</p>
                                        <p className="text-gray-300">Vendas: {item.sales}</p>
                                        <p className="text-gray-300">Pedidos: {item.orders}</p>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}

                            {/* Bars */}
                            <div className="w-full space-y-1">
                                {showCurrentPeriod && (
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                                        style={{
                                            height: `${Math.max((item.revenue / maxRevenue) * 200, 4)}px`
                                        }}
                                    />
                                )}

                                {showPreviousPeriod && showPreviousPeriodState && (
                                    <div
                                        className="w-full bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-md hover:from-gray-500 hover:to-gray-400 transition-colors cursor-pointer opacity-70"
                                        style={{
                                            height: `${Math.max(((item.revenue * 0.8) / maxRevenue) * 200, 2)}px`
                                        }}
                                    />
                                )}
                            </div>

                            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                                {item.date}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1 font-medium">Total</p>
                    <p className="text-lg font-bold text-blue-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(totalRevenue)}
                    </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 mb-1 font-medium">Média</p>
                    <p className="text-lg font-bold text-green-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(averageRevenue)}
                    </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1 font-medium">Pedidos</p>
                    <p className="text-lg font-bold text-purple-900">
                        {new Intl.NumberFormat('pt-BR').format(totalOrders)}
                    </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-600 mb-1 font-medium">Projeção</p>
                    <p className="text-lg font-bold text-emerald-900">+15%</p>
                </div>
            </div>
        </div>
    );
};
