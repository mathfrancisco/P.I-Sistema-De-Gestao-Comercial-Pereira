import {SalesChartData} from "@/types/dashboard";
import React, {useState} from "react";
import {Skeleton} from "@/components/ui/loading";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";

interface SalesChartProps {
    data: SalesChartData[];
    period: 'day' | 'week' | 'month' | 'year';
    onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
    loading?: boolean;
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

    const periods = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' }
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

    // Simular gráfico (normalmente usaria Recharts)
    const maxRevenue = Math.max(...data.map(d => d.revenue));

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-96">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Vendas por Período</h3>
                    <p className="text-sm text-gray-500">Vendas vs período anterior</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Period Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {periods.map(p => (
                            <button
                                key={p.value}
                                onClick={() => onPeriodChange(p.value as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
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
                        <Button variant="secondary" size="sm" leftIcon={Download} onClick={onExport}>
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Interactive Legend */}
            <div className="flex items-center space-x-6 mb-4">
                <button
                    onClick={() => setShowCurrentPeriod(!showCurrentPeriod)}
                    className={`flex items-center space-x-2 text-sm transition-opacity ${
                        showCurrentPeriod ? 'opacity-100' : 'opacity-50'
                    }`}
                >
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Período Atual</span>
                </button>

                {showPreviousPeriod && (
                    <button
                        onClick={() => setShowPreviousPeriodState(!showPreviousPeriodState)}
                        className={`flex items-center space-x-2 text-sm transition-opacity ${
                            showPreviousPeriodState ? 'opacity-100' : 'opacity-50'
                        }`}
                    >
                        <div className="w-3 h-3 bg-gray-400 rounded"></div>
                        <span>Período Anterior</span>
                    </button>
                )}
            </div>

            {/* Chart Area com Tooltip Customizado */}
            <div className="h-48 flex items-end space-x-1 border-b border-gray-200 pb-4 relative group">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center relative">
                        {/* Tooltip Customizado */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded py-1 px-2 transition-opacity pointer-events-none z-10">
                            <div className="text-center">
                                <p className="font-semibold">{item.date}</p>
                                <p>Receita: R$ {new Intl.NumberFormat('pt-BR').format(item.revenue)}</p>
                                <p>Vendas: {item.sales}</p>
                                <p>Pedidos: {item.orders}</p>
                            </div>
                        </div>

                        {/* Bars */}
                        {showCurrentPeriod && (
                            <div
                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                style={{
                                    height: `${(item.revenue / maxRevenue) * 160}px`,
                                    minHeight: '8px'
                                }}
                            />
                        )}

                        {showPreviousPeriod && showPreviousPeriodState && (
                            <div
                                className="w-full bg-gray-400 rounded-t hover:bg-gray-500 transition-colors cursor-pointer opacity-60"
                                style={{
                                    height: `${((item.revenue * 0.8) / maxRevenue) * 160}px`, // Simular período anterior
                                    minHeight: '4px'
                                }}
                            />
                        )}

                        <span className="text-xs text-gray-500 mt-2 truncate">
              {item.date}
            </span>
                    </div>
                ))}
            </div>

            {/* Footer com Mini Cards */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(
                        data.reduce((sum, item) => sum + item.revenue, 0)
                    )}
                    </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Média</p>
                    <p className="text-lg font-semibold text-gray-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(
                        data.reduce((sum, item) => sum + item.revenue, 0) / data.length
                    )}
                    </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Projeção</p>
                    <p className="text-lg font-semibold text-green-600">
                        +15%
                    </p>
                </div>
            </div>
        </div>
    );
};
