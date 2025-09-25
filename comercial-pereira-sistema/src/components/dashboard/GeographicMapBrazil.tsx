import React, {useState} from "react";
import {Skeleton} from "@/components/ui/loading";
import {MapPin} from "lucide-react";

interface GeographicMapBrazilProps {
    salesByState: { state: string; value: number; percentage: number }[];
    loading?: boolean;
}

export const GeographicMapBrazil: React.FC<GeographicMapBrazilProps> = ({
                                                                                    salesByState,
                                                                                    loading = false
                                                                                }) => {
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                    <Skeleton width="200px" height="1.5rem" />
                    <Skeleton width="300px" height="1rem" />
                </div>
                <Skeleton height="300px" />
            </div>
        );
    }

    const maxValue = Math.max(...salesByState.map(s => s.value));
    const totalValue = salesByState.reduce((sum, s) => sum + s.value, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                        Vendas por Estado
                    </h3>
                    <p className="text-sm text-gray-500">Distribuição geográfica das vendas</p>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'list'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'chart'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Gráfico
                    </button>
                </div>
            </div>

            {/* Simplified Brazil Map Representation */}
            <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4">
                        <MapPin className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="absolute top-4 right-4">
                        <MapPin className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <MapPin className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>

                <div className="relative z-10 text-center h-full flex flex-col justify-center">
                    <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900">Brasil</h4>
                    <p className="text-sm text-gray-600 mt-1">
                        R$ {new Intl.NumberFormat('pt-BR').format(totalValue)} em vendas
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Distribuído em {salesByState.length} estados
                    </p>
                </div>
            </div>

            {viewMode === 'list' ? (
                /* List View */
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-4">
                        <span>Estado</span>
                        <span>Vendas / Participação</span>
                    </div>

                    {salesByState.slice(0, 8).map((state, index) => (
                        <div
                            key={state.state}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                selectedState === state.state
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                            }`}
                            onClick={() => setSelectedState(selectedState === state.state ? null : state.state)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                                    ${index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'}
                                `}>
                                    {index + 1}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">{state.state}</span>
                                    {selectedState === state.state && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Posição #{index + 1} no ranking
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        R$ {new Intl.NumberFormat('pt-BR').format(state.value)}
                                    </p>
                                    <p className="text-sm text-gray-500">{state.percentage.toFixed(1)}%</p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(state.value / maxValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Chart View */
                <div className="space-y-4">
                    {salesByState.slice(0, 8).map((state, index) => (
                        <div key={state.state} className="flex items-center space-x-4">
                            <div className="w-24 text-sm font-medium text-gray-900 truncate">
                                {state.state}
                            </div>
                            <div className="flex-1 relative">
                                <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                                    <div
                                        className={`h-full rounded-lg transition-all duration-700 ${
                                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                                    index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                                        'bg-gradient-to-r from-blue-400 to-blue-500'
                                        }`}
                                        style={{ width: `${(state.value / maxValue) * 100}%` }}
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center px-3">
                                    <span className="text-sm font-medium text-white">
                                        {state.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-24 text-right">
                                <span className="text-sm font-semibold text-gray-900">
                                    R$ {(state.value / 1000).toFixed(0)}k
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Top Estado</p>
                        <p className="font-semibold text-gray-900">{salesByState[0]?.state}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Vendas</p>
                        <p className="font-semibold text-gray-900">
                            R$ {new Intl.NumberFormat('pt-BR').format(totalValue)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Estados</p>
                        <p className="font-semibold text-gray-900">{salesByState.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};