import React from "react";
import {Skeleton} from "@/components/ui/loading";
import {TrendingDown, TrendingUp} from "lucide-react";

interface DashboardMetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    bgColor?: string;
    loading?: boolean;
    period?: string;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
                                                                            label,
                                                                            value,
                                                                            change,
                                                                            trend,
                                                                            icon: Icon,
                                                                            color = 'text-blue-600',
                                                                            bgColor = 'bg-blue-100',
                                                                            loading = false,
                                                                            period = 'From last week'
                                                                        }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton lines={3} height="1.5rem" />
            </div>
        );
    }

    const getTrendIcon = () => {
        if (!change) return null;

        if (trend === 'UP' || change > 0) {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        } else if (trend === 'DOWN' || change < 0) {
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        }
        return null;
    };

    const getTrendColor = () => {
        if (!change) return 'text-gray-500';
        return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {typeof value === 'number' && value > 999
                            ? new Intl.NumberFormat('pt-BR').format(value)
                            : value
                        }
                    </p>
                    {change !== undefined && (
                        <div className="flex items-center mt-2">
                            {getTrendIcon()}
                            <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
                            <span className="text-xs text-gray-500 ml-2">{period}</span>
                        </div>
                    )}
                </div>

                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
};
