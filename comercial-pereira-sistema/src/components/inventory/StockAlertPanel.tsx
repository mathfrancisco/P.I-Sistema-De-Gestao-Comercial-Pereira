import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    ShoppingCart,
    X,
    RefreshCw
} from 'lucide-react';
import { InventoryAlert, UrgencyLevel } from '@/types/inventory';

interface StockAlertPanelProps {
    alerts: InventoryAlert[];
    onCreateOrder?: (productIds: number[]) => void;
    onDismiss?: (productId: number) => void;
    onRefresh?: () => void;
}

export const StockAlertPanel: React.FC<StockAlertPanelProps> = ({
                                                                    alerts,
                                                                    onCreateOrder,
                                                                    onDismiss,
                                                                    onRefresh
                                                                }) => {
    const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);

    const getUrgencyBadge = (level: UrgencyLevel) => {
        const variants = {
            CRITICAL: 'destructive',
            HIGH: 'warning',
            MEDIUM: 'secondary',
            LOW: 'outline'
        } as const;

        const labels = {
            CRITICAL: 'Crítico',
            HIGH: 'Alto',
            MEDIUM: 'Médio',
            LOW: 'Baixo'
        };

        return (
            <Badge variant={variants[level]}>
                {labels[level]}
            </Badge>
        );
    };

    const handleSelectProduct = (productId: number, checked: boolean) => {
        setSelectedProducts(prev =>
            checked ? [...prev, productId] : prev.filter(id => id !== productId)
        );
    };

    const handleCreateOrder = () => {
        if (selectedProducts.length > 0 && onCreateOrder) {
            onCreateOrder(selectedProducts);
            setSelectedProducts([]);
        }
    };

    const criticalCount = alerts.filter(a => a.urgencyLevel === 'CRITICAL').length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas de Estoque
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        className="h-8 w-8"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {criticalCount > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {criticalCount} produto(s) em situação crítica!
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.productId}
                            className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                            <Checkbox
                                checked={selectedProducts.includes(alert.productId)}
                                onCheckedChange={(checked) =>
                                    handleSelectProduct(alert.productId, checked as boolean)
                                }
                            />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium">{alert.productName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {alert.productCode} • {alert.categoryName}
                                        </p>
                                    </div>
                                    {getUrgencyBadge(alert.urgencyLevel)}
                                </div>
                                <div className="text-sm space-y-1">
                                    <p>
                                        Estoque atual: <span className="font-semibold">{alert.currentStock}</span> /
                                        Mínimo: <span className="font-semibold">{alert.minStock}</span>
                                    </p>
                                    {alert.averageDailySales > 0 && (
                                        <p className="text-muted-foreground">
                                            Vendas médias: {alert.averageDailySales.toFixed(1)} un/dia
                                            {alert.daysUntilOutOfStock > 0 &&
                                                ` • ${alert.daysUntilOutOfStock} dias até acabar`
                                            }
                                        </p>
                                    )}
                                    {alert.maxStock && (
                                        <p className="text-blue-600">
                                            Sugestão de pedido: {alert.maxStock - alert.currentStock} unidades
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDismiss?.(alert.productId)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {selectedProducts.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} produto(s) selecionado(s)
            </span>
                        <Button onClick={handleCreateOrder}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Criar Pedido
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};