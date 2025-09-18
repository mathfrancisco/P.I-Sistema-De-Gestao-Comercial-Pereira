// components/customers/CustomerAnalyticsPanel.tsx
import React from 'react';
import {DollarSign,
    Award, Target, Star, BarChart3, PieChart,
    Clock, ShoppingBag, Zap, Crown, Medal
} from 'lucide-react';
import { CustomerWithStats, CustomerSegment, getCustomerSegment } from '@/types/customer';

interface CustomerAnalyticsPanelProps {
    customer: CustomerWithStats;
    className?: string;
}

interface RFMMetrics {
    recency: {
        score: number;
        days: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
    };
    frequency: {
        score: number;
        purchases: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
    };
    monetary: {
        score: number;
        value: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
    };
}

export const CustomerAnalyticsPanel: React.FC<CustomerAnalyticsPanelProps> = ({
                                                                                  customer,
                                                                                  className = ''
                                                                              }) => {
    // Calcular métricas RFM
    const calculateRFMMetrics = (): RFMMetrics => {
        const now = new Date();

        // Recency (dias desde última compra)
        const lastPurchase = customer.statistics.lastPurchase;
        const recencyDays = lastPurchase
            ? Math.floor((now.getTime() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24))
            : 9999;

        // Frequency (número de compras)
        const frequency = customer.statistics.totalSales;

        // Monetary (valor total gasto)
        const monetary = customer.statistics.totalSpent;

        // Scoring (1-5 scale)
        const getRecencyScore = (days: number) => {
            if (days <= 30) return { score: 5, status: 'excellent' as const };
            if (days <= 90) return { score: 4, status: 'good' as const };
            if (days <= 180) return { score: 3, status: 'fair' as const };
            return { score: 1, status: 'poor' as const };
        };

        const getFrequencyScore = (purchases: number) => {
            if (purchases >= 20) return { score: 5, status: 'excellent' as const };
            if (purchases >= 10) return { score: 4, status: 'good' as const };
            if (purchases >= 5) return { score: 3, status: 'fair' as const };
            if (purchases >= 1) return { score: 2, status: 'fair' as const };
            return { score: 1, status: 'poor' as const };
        };

        const getMonetaryScore = (value: number) => {
            if (value >= 10000) return { score: 5, status: 'excellent' as const };
            if (value >= 5000) return { score: 4, status: 'good' as const };
            if (value >= 2000) return { score: 3, status: 'fair' as const };
            if (value >= 500) return { score: 2, status: 'fair' as const };
            return { score: 1, status: 'poor' as const };
        };

        const recencyMetric = getRecencyScore(recencyDays);
        const frequencyMetric = getFrequencyScore(frequency);
        const monetaryMetric = getMonetaryScore(monetary);

        return {
            recency: {
                score: recencyMetric.score,
                days: recencyDays,
                status: recencyMetric.status
            },
            frequency: {
                score: frequencyMetric.score,
                purchases: frequency,
                status: frequencyMetric.status
            },
            monetary: {
                score: monetaryMetric.score,
                value: monetary,
                status: monetaryMetric.status
            }
        };
    };

    const rfmMetrics = calculateRFMMetrics();
    const overallScore = Math.round((rfmMetrics.recency.score + rfmMetrics.frequency.score + rfmMetrics.monetary.score) / 3);
    const segment = getCustomerSegment(customer.statistics);

    // Componente para gauge/medidor
    const RFMGauge: React.FC<{
        title: string;
        score: number;
        status: string;
        value: string;
        icon: any;
        color: string;
    }> = ({ title, score, status, value, icon: Icon, color }) => {
        const percentage = (score / 5) * 100;

        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{title}</h4>
                        <p className="text-sm text-gray-500">{value}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Score: {score}/5</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            status === 'excellent' ? 'bg-green-100 text-green-800' :
                                status === 'good' ? 'bg-blue-100 text-blue-800' :
                                    status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                        }`}>
              {status === 'excellent' ? 'Excelente' :
                  status === 'good' ? 'Bom' :
                      status === 'fair' ? 'Regular' : 'Baixo'}
            </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                status === 'excellent' ? 'bg-green-500' :
                                    status === 'good' ? 'bg-blue-500' :
                                        status === 'fair' ? 'bg-yellow-500' :
                                            'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Recomendações baseadas no perfil
    const getRecommendations = () => {
        const recommendations = [];

        // Baseado na recência
        if (rfmMetrics.recency.days > 90) {
            recommendations.push({
                type: 'recency',
                title: 'Reativar Cliente',
                description: 'Cliente inativo há mais de 90 dias. Considere uma campanha de reativação.',
                action: 'Enviar oferta especial',
                priority: 'high'
            });
        } else if (rfmMetrics.recency.days > 30) {
            recommendations.push({
                type: 'recency',
                title: 'Manter Engajamento',
                description: 'Cliente não compra há um tempo. Mantenha contato regular.',
                action: 'Newsletter ou promoção',
                priority: 'medium'
            });
        }

        // Baseado na frequência
        if (rfmMetrics.frequency.score >= 4) {
            recommendations.push({
                type: 'frequency',
                title: 'Cliente Fiel',
                description: 'Cliente frequente. Ofereça programa de fidelidade.',
                action: 'Programa VIP',
                priority: 'medium'
            });
        } else if (rfmMetrics.frequency.score <= 2) {
            recommendations.push({
                type: 'frequency',
                title: 'Aumentar Frequência',
                description: 'Baixa frequência de compras. Estimule mais visitas.',
                action: 'Ofertas regulares',
                priority: 'medium'
            });
        }

        // Baseado no valor monetário
        if (rfmMetrics.monetary.score >= 4) {
            recommendations.push({
                type: 'monetary',
                title: 'Alto Valor',
                description: 'Cliente de alto valor. Mantenha relacionamento próximo.',
                action: 'Atendimento personalizado',
                priority: 'high'
            });
        } else if (rfmMetrics.monetary.score <= 2) {
            recommendations.push({
                type: 'monetary',
                title: 'Aumentar Ticket',
                description: 'Baixo valor por compra. Incentive compras maiores.',
                action: 'Upselling e cross-selling',
                priority: 'medium'
            });
        }

        // Baseado no segmento
        if (segment === CustomerSegment.VIP) {
            recommendations.push({
                type: 'segment',
                title: 'Cliente VIP',
                description: 'Mantenha experiência premium e relacionamento exclusivo.',
                action: 'Atendimento VIP',
                priority: 'high'
            });
        }

        return recommendations.slice(0, 4); // Mostrar apenas as 4 principais
    };

    const recommendations = getRecommendations();

    // Configuração do score geral
    const getOverallConfig = () => {
        if (overallScore >= 4) return {
            color: 'bg-green-500',
            textColor: 'text-green-800',
            bgColor: 'bg-green-100',
            icon: Crown,
            classification: 'Ouro',
            description: 'Cliente de alto valor e excelente relacionamento'
        };
        if (overallScore >= 3) return {
            color: 'bg-blue-500',
            textColor: 'text-blue-800',
            bgColor: 'bg-blue-100',
            icon: Medal,
            classification: 'Prata',
            description: 'Cliente valioso com bom potencial'
        };
        if (overallScore >= 2) return {
            color: 'bg-orange-500',
            textColor: 'text-orange-800',
            bgColor: 'bg-orange-100',
            icon: Award,
            classification: 'Bronze',
            description: 'Cliente regular com oportunidades de crescimento'
        };
        return {
            color: 'bg-gray-500',
            textColor: 'text-gray-800',
            bgColor: 'bg-gray-100',
            icon: Target,
            classification: 'Desenvolvimento',
            description: 'Cliente com potencial a ser desenvolvido'
        };
    };

    const overallConfig = getOverallConfig();
    const OverallIcon = overallConfig.icon;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Score Geral */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Score RFM Geral</h3>
                    <div className={`px-3 py-1 rounded-full ${overallConfig.bgColor} ${overallConfig.textColor} flex items-center gap-2`}>
                        <OverallIcon className="w-4 h-4" />
                        <span className="font-medium">{overallConfig.classification}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${(overallScore / 5) * 251.2} 251.2`}
                                className={overallConfig.color.replace('bg-', 'text-')}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{overallScore}</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                            Classificação {overallConfig.classification}
                        </h4>
                        <p className="text-gray-600 mb-3">
                            {overallConfig.description}
                        </p>
                        <div className="text-sm text-gray-500">
                            Score baseado em Recência, Frequência e Valor Monetário
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas RFM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RFMGauge
                    title="Recência"
                    score={rfmMetrics.recency.score}
                    status={rfmMetrics.recency.status}
                    value={`${rfmMetrics.recency.days} dias atrás`}
                    icon={Clock}
                    color="bg-blue-500"
                />

                <RFMGauge
                    title="Frequência"
                    score={rfmMetrics.frequency.score}
                    status={rfmMetrics.frequency.status}
                    value={`${rfmMetrics.frequency.purchases} compras`}
                    icon={ShoppingBag}
                    color="bg-green-500"
                />

                <RFMGauge
                    title="Valor Monetário"
                    score={rfmMetrics.monetary.score}
                    status={rfmMetrics.monetary.status}
                    value={`R$ ${rfmMetrics.monetary.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
            </div>

            {/* Evolução Temporal */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Evolução do Cliente</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BarChart3 className="w-4 h-4" />
                        Últimos 12 meses
                    </div>
                </div>

                {/* Mock de gráfico - seria substituído por um gráfico real */}
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Gráfico de evolução de compras</p>
                        <p className="text-xs">Implementar com biblioteca de gráficos</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-green-600">+23%</div>
                        <div className="text-sm text-gray-500">Crescimento</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-600">R$ {customer.statistics.averageOrderValue.toFixed(0)}</div>
                        <div className="text-sm text-gray-500">Ticket Médio</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-600">{customer.statistics.favoriteCategories.length}</div>
                        <div className="text-sm text-gray-500">Categorias</div>
                    </div>
                </div>
            </div>

            {/* Recomendações */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Recomendações</h3>
                </div>

                {recommendations.length > 0 ? (
                    <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 ${
                                    rec.priority === 'high'
                                        ? 'bg-red-50 border-red-400'
                                        : 'bg-blue-50 border-blue-400'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {rec.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {rec.description}
                                        </p>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            rec.priority === 'high'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            <Target className="w-3 h-3" />
                                            {rec.action}
                                        </div>
                                    </div>

                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        rec.priority === 'high'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {rec.priority === 'high' ? 'Alta' : 'Média'} Prioridade
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <Star className="w-8 h-8 mx-auto mb-2" />
                        <p>Cliente com perfil equilibrado</p>
                        <p className="text-sm">Continue mantendo o bom relacionamento</p>
                    </div>
                )}
            </div>

            {/* Categorias Favoritas */}
            {customer.statistics.favoriteCategories.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Preferências de Categoria</h3>
                    </div>

                    <div className="space-y-3">
                        {customer.statistics.favoriteCategories.slice(0, 5).map((category, index) => {
                            const maxSpent = Math.max(...customer.statistics.favoriteCategories.map(c => c.totalSpent));
                            const percentage = (category.totalSpent / maxSpent) * 100;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </span>
                                        <span className="text-sm text-gray-500">
                      R$ {category.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {category.purchaseCount} compra{category.purchaseCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};