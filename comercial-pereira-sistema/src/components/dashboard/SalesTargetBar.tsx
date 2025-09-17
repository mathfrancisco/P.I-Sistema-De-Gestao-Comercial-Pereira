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
                                                                  label = 'Sales Target',
                                                                  period = 'Monthly',
                                                                  loading = false
                                                              }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton lines={2} height="2rem" />
            </div>
        );
    }

    const percentage = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500">{period}</p>
                </div>
                <div className={`flex items-center space-x-2 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    <Target className="w-5 h-5" />
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                    {isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>

                {/* Values */}
                <div className="flex justify-between mt-3 text-sm">
          <span className="font-medium text-gray-900">
            R$ {new Intl.NumberFormat('pt-BR').format(current)}
          </span>
                    <span className="text-gray-500">
            Meta: R$ {new Intl.NumberFormat('pt-BR').format(target)}
          </span>
                </div>
            </div>
        </div>
    );
};