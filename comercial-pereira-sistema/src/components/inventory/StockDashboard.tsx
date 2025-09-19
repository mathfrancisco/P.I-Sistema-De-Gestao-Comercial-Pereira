import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Package,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Plus,
    FileText,
    BarChart3
} from 'lucide-react';
import { useInventoryStats, useInventoryAlerts } from '@/hooks/useInventory';
import { formatCurrency } from '@/lib/utils';

export const StockDashboard = () => {
    const { data: stats, isLoading: statsLoading } = useInventoryStats();
    const { data: alerts } = useInventoryAlerts('low-stock');

    const criticalAlerts = alerts?.filter(a => a.urgencyLevel === 'CRITICAL') || [];

    const metrics = [
        {
            title: 'Total Items',
            value: stats?.totalProducts || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Out of Stock',
            value: stats?.outOfStockCount || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            title: 'Low Stock',
            value: stats?.lowStockCount || 0,
            icon: TrendingDown,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Stock Value',
            value: formatCurrency(stats?.totalValue || 0),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Alert Banner */}
            {criticalAlerts.length > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                        {criticalAlerts.length} produto(s) em situação crítica de estoque.
                        Providencie reabastecimento imediato.
                    </AlertDescription>
                </Alert>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                                        <p className="text-2xl font-bold mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 flex-wrap">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajustar Estoque
                        </Button>
                        <Button variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Contagem de Estoque
                        </Button>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Relatórios
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};