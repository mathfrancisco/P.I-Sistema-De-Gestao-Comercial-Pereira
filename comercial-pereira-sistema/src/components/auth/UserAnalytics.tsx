import React, { useState } from 'react';
import {
    Crown, UserCheck, Users, UserX, TrendingUp, TrendingDown,
    Eye, MoreHorizontal, Calendar, Filter, Download, RefreshCw,
    Activity, Clock, Shield, Zap, Award, AlertTriangle
} from 'lucide-react';

interface UserStatistics {
    total: number;
    active: number;
    inactive: number;
    newThisWeek: number;
    newThisMonth: number;
    loginToday: number;
    byRole: Record<string, number>;
    activityTrend: Array<{ date: string; count: number }>;
    averageSessionTime: string;
    topActiveUsers: Array<{ name: string; sessions: number }>;
}

interface UserAnalyticsPanelProps {
    statistics: UserStatistics;
    loading?: boolean;
    onRefresh?: () => void;
    onExport?: () => void;
    onFilterChange?: (filter: string) => void;
}

export const UserAnalyticsPanel: React.FC<UserAnalyticsPanelProps> = ({
                                                                                  statistics,
                                                                                  loading = false,
                                                                                  onRefresh,
                                                                                  onExport,
                                                                                  onFilterChange
                                                                              }) => {
    const [timeFilter, setTimeFilter] = useState('week');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                    <div className="flex space-x-2">
                        <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Calculate growth percentages (mock data for demonstration)
    const growthData = {
        total: { value: ((statistics.newThisMonth / statistics.total) * 100), isPositive: true },
        active: { value: 12.5, isPositive: true },
        inactive: { value: -8.3, isPositive: false },
        admins: { value: 5.2, isPositive: true }
    };

    const primaryCards = [
        {
            id: 'total',
            title: 'Total de Usuários',
            value: statistics.total || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
            change: growthData.total.value,
            changeType: growthData.total.isPositive ? 'positive' : 'negative',
            subtitle: `+${statistics.newThisMonth || 0} este mês`,
            chartData: statistics.activityTrend || []
        },
        {
            id: 'active',
            title: 'Usuários Ativos',
            value: statistics.active || 0,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            change: growthData.active.value,
            changeType: 'positive',
            subtitle: `${statistics.loginToday || 0} logados hoje`,
            chartData: []
        },
        {
            id: 'inactive',
            title: 'Usuários Inativos',
            value: statistics.inactive || 0,
            icon: UserX,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-200',
            change: growthData.inactive.value,
            changeType: 'negative',
            subtitle: 'Sem atividade há 30+ dias',
            chartData: []
        },
        {
            id: 'admins',
            title: 'Administradores',
            value: statistics.byRole?.ADMIN || 0,
            icon: Crown,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-200',
            change: growthData.admins.value,
            changeType: 'positive',
            subtitle: `${(((statistics.byRole?.ADMIN || 0) / statistics.total) * 100).toFixed(1)}% do total`,
            chartData: []
        }
    ];

    const secondaryCards = [
        {
            title: 'Novos Usuários',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
            stats: [
                { label: 'Esta semana', value: statistics.newThisWeek || 0 },
                { label: 'Este mês', value: statistics.newThisMonth || 0 }
            ]
        },
        {
            title: 'Tempo Médio de Sessão',
            icon: Clock,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            stats: [
                { label: 'Tempo médio', value: statistics.averageSessionTime || '24 min' },
                { label: 'Sessions hoje', value: statistics.loginToday || 0 }
            ]
        },
        {
            title: 'Por Função',
            icon: Shield,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
            stats: [
                { label: 'Gerentes', value: statistics.byRole?.MANAGER || 0 },
                { label: 'Vendedores', value: statistics.byRole?.SALESPERSON || 0 }
            ]
        }
    ];

    const toggleCardExpansion = (cardId: string) => {
        setExpandedCard(expandedCard === cardId ? null : cardId);
    };

    const renderMiniChart = (data: Array<{ date: string; count: number }>) => {
        if (!data || data.length === 0) return null;

        const max = Math.max(...data.map(d => d.count));
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 60;
            const y = 20 - ((d.count / max) * 15);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width="60" height="20" className="absolute bottom-2 right-2 opacity-30">
                <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-600"
                />
            </svg>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-blue-600" />
                        Analytics de Usuários
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Visão geral da base de usuários e atividade
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={timeFilter}
                        onChange={(e) => {
                            setTimeFilter(e.target.value);
                            onFilterChange?.(e.target.value);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="week">Última semana</option>
                        <option value="month">Último mês</option>
                        <option value="quarter">Último trimestre</option>
                        <option value="year">Último ano</option>
                    </select>

                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Atualizar dados"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                    )}

                    {onExport && (
                        <button
                            onClick={onExport}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                        </button>
                    )}
                </div>
            </div>

            {/* Primary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {primaryCards.map((card) => (
                    <div
                        key={card.id}
                        className={`
                            bg-white rounded-xl border-2 ${card.borderColor} p-6 
                            hover:shadow-lg transition-all duration-200 cursor-pointer
                            ${expandedCard === card.id ? 'shadow-lg transform scale-105' : ''}
                        `}
                        onClick={() => toggleCardExpansion(card.id)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <div className="flex items-center mt-2">
                                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    {card.change !== undefined && (
                                        <div className={`
                                            ml-2 flex items-center text-sm font-medium
                                            ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
                                        `}>
                                            {card.changeType === 'positive' ? (
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 mr-1" />
                                            )}
                                            {Math.abs(card.change).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center relative`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                                {renderMiniChart(card.chartData)}
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            {card.subtitle}
                        </div>

                        {/* Expanded content */}
                        {expandedCard === card.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Crescimento mensal:</span>
                                        <span className="font-medium">+{card.change?.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Média diária:</span>
                                        <span className="font-medium">{(card.value / 30).toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {secondaryCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">{card.title}</h3>
                            <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {card.stats.map((stat, statIndex) => (
                                <div key={statIndex} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{stat.label}</span>
                                    <span className="font-semibold text-gray-900">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Active Users */}
            {statistics.topActiveUsers && statistics.topActiveUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-500" />
                            Usuários Mais Ativos
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                            Ver todos
                        </button>
                    </div>

                    <div className="space-y-3">
                        {statistics.topActiveUsers.slice(0, 5).map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                                        ${index === 0 ? 'bg-yellow-400 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                            index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-700'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <span className="ml-3 font-medium text-gray-900">{user.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Activity className="w-4 h-4 mr-1" />
                                    {user.sessions} sessões
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Ações Rápidas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                        <span className="font-medium">Ativar Usuários</span>
                    </button>

                    <button className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Eye className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium">Ver Relatório</span>
                    </button>

                    <button className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                        <span className="font-medium">Revisar Inativos</span>
                    </button>
                </div>
            </div>
        </div>
    );
};