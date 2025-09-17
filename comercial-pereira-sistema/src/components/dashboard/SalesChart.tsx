import {SalesChartData} from "@/types/dashboard";
import React from "react";
import {Skeleton} from "@/components/ui/loading";

interface SalesChartProps {
    data: SalesChartData[];
    period: 'day' | 'week' | 'month' | 'year';
    onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
    loading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({
                                                          data,
                                                          period,
                                                          onPeriodChange,
                                                          loading = false
                                                      }) => {
    const periods = [
        { value: 'day', label: 'Hoje' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' }
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Vendas por Período</h3>
                    <p className="text-sm text-gray-500">Acompanhe a evolução das vendas</p>
                </div>

                {/* Period Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {periods.map(p => (
                        <button
                            key={p.value}
                            onClick={() => onPeriodChange(p.value as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                period === p.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-80 flex items-end space-x-2 border-b border-gray-200 pb-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                            style={{
                                height: `${(item.revenue / maxRevenue) * 240}px`,
                                minHeight: '8px'
                            }}
                            title={`${item.date}: R$ ${new Intl.NumberFormat('pt-BR').format(item.revenue)}`}
                        />
                        <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
              {item.date}
            </span>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(
                        data.reduce((sum, item) => sum + item.revenue, 0)
                    )}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Média</p>
                    <p className="text-lg font-semibold text-gray-900">
                        R$ {new Intl.NumberFormat('pt-BR').format(
                        data.reduce((sum, item) => sum + item.revenue, 0) / data.length
                    )}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Pedidos</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {data.reduce((sum, item) => sum + item.orders, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
};