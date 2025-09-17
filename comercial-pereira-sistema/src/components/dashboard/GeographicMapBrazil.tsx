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

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton height="400px" />
            </div>
        );
    }

    const maxValue = Math.max(...salesByState.map(s => s.value));

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Vendas por Estado</h3>
                <p className="text-sm text-gray-500">Distribuição geográfica das vendas</p>
            </div>

            {/* Simplified Brazil Map Representation */}
            <div className="relative h-80 bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center pt-20">
                    <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Mapa Interativo do Brasil</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Clique nos estados para ver detalhes
                    </p>
                </div>
            </div>

            {/* States List */}
            <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Top Estados</h4>
                {salesByState.slice(0, 5).map((state, index) => (
                    <div
                        key={state.state}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedState === state.state ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedState(state.state)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded text-white text-sm font-medium flex items-center justify-center">
                                {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{state.state}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="font-medium text-gray-900">
                                    R$ {new Intl.NumberFormat('pt-BR').format(state.value)}
                                </p>
                                <p className="text-sm text-gray-500">{state.percentage}%</p>
                            </div>

                            {/* Mini Bar */}
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(state.value / maxValue) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
