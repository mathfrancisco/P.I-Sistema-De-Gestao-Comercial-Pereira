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
            <div className="bg-white rounded-xl border border-gray-200 h-20 p-4">
                <Skeleton lines={2} height="1rem" />
            </div>
        );
    }

    const percentage = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;

    return (
        <div className="bg-white rounded-xl border border-gray-200 h-20 p-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-500">Meta: R$ {new Intl.NumberFormat('pt-BR').format(target)}</p>
                </div>
                <div className={`flex items-center space-x-1 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    <span className="font-medium text-sm">{percentage.toFixed(1)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Current Value */}
                <div className="flex justify-between mt-1">
          <span className="text-xs font-medium text-gray-900">
            R$ {new Intl.NumberFormat('pt-BR').format(current)}
          </span>
                    <span className="text-xs text-gray-500">
            {period}
          </span>
                </div>
            </div>
        </div>
    );
};