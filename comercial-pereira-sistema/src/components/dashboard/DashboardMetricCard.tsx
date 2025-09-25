import React from 'react';
import {
    TrendingUp, TrendingDown, Activity,
} from 'lucide-react';

// ============================================
// SKELETON LOADER COMPONENT
// ============================================
interface SkeletonProps {
    lines?: number;
    height?: string;
    width?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ lines = 1, height = "1rem", width = "100%" }) => {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-200 rounded"
                    style={{ height, width: i === lines - 1 ? "75%" : width }}
                />
            ))}
        </div>
    );
};

// ============================================
// DASHBOARD METRIC CARD - LIMPO
// ============================================
interface DashboardMetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    loading?: boolean;
    period?: string;
    onClick?: () => void;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
                                                                                 label,
                                                                                 value,
                                                                                 change,
                                                                                 trend,
                                                                                 icon: Icon,
                                                                                 color = 'text-blue-600',
                                                                                 bgColor = 'bg-blue-100',
                                                                                 borderColor = 'border-blue-200',
                                                                                 loading = false,
                                                                                 period = 'From last week',
                                                                                 onClick
                                                                             }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-32">
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
        return <Activity className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (!change) return 'text-gray-500';
        return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div
            className={`
                bg-white rounded-xl border-2 ${borderColor} p-6 h-32 
                hover:shadow-lg transition-all duration-200 cursor-pointer
                hover:scale-105 group
            `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between h-full">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
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

                <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
};
