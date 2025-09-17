import React from "react";
import {Skeleton} from "@/components/ui/loading";
import {TrendingDown, TrendingUp} from "lucide-react";

interface DashboardMetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    icon: React.ComponentType;
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
            <div className="bg-white rounded-xl border border-gray-200 h-30 p-5">
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
        <div className="bg-white rounded-xl border border-gray-200 h-30 p-5 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between h-full">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                        {typeof value === 'number' && value > 999
                            ? new Intl.NumberFormat('pt-BR').format(value)
                            : value
                        }
                    </p>
                    {change !== undefined && (
                        <div className="flex items-center">
                            {getTrendIcon()}
                            <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
                            <span className="text-xs text-gray-500 ml-2">{period}</span>
                        </div>
                    )}
                </div>

                <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon  />
                </div>
            </div>
        </div>
    );
};