import {Skeleton} from "@/components/ui/loading";
import React from "react";
import {CheckCircle, Target} from "lucide-react";

interface SalesTargetBarProps {
    current: number;
    target: number;
    label?: string;
    period?: string;
    loading?: boolean;
}

export const SalesTargetBar: React.FC<SalesTargetBarProps> = ({
                                                                          current,
                                                                          target,
                                                                          label = 'Meta de Vendas',
                                                                          period = 'Mensal',
                                                                          loading = false
                                                                      }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton lines={3} height="1.5rem" />
            </div>
        );
    }

    const percentage = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;
    const remaining = Math.max(target - current, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                        {label}
                    </h3>
                    <p className="text-sm text-gray-500">Meta: R$ {new Intl.NumberFormat('pt-BR').format(target)}</p>
                </div>
                <div className={`flex items-center space-x-2 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {isCompleted && <CheckCircle className="w-5 h-5" />}
                    <span className="font-bold text-lg">{percentage.toFixed(1)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            isCompleted
                                ? 'bg-gradient-to-r from-green-500 to-green-400'
                                : 'bg-gradient-to-r from-blue-500 to-blue-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="h-full bg-white bg-opacity-20 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Progress Text */}
                <div className="flex justify-between mt-2">
                    <div>
                        <span className="text-sm font-medium text-gray-900">
                            R$ {new Intl.NumberFormat('pt-BR').format(current)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">atual</span>
                    </div>
                    <span className="text-xs text-gray-500">{period}</span>
                </div>
            </div>

            {/* Status Message */}
            <div className={`p-3 rounded-lg ${
                isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
            }`}>
                {isCompleted ? (
                    <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Meta atingida! Parabéns!</span>
                    </div>
                ) : (
                    <div className="text-blue-700">
                        <div className="flex items-center mb-1">
                            <Target className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">
                                Faltam R$ {new Intl.NumberFormat('pt-BR').format(remaining)}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600">
                            Continue assim para atingir sua meta!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};