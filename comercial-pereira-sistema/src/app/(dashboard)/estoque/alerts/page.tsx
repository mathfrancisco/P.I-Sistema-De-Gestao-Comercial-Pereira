'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertTriangle,
    TrendingDown,
    Package,
    RefreshCw,
    ShoppingCart,
    FileText
} from 'lucide-react';

import { InventoryAlert, UrgencyLevel } from '@/types/inventory';
import {useInventoryAlerts} from "@/lib/hooks/useInventoryAlerts";

export default function StockAlertsPage() {
    const { data: lowStockAlerts, refetch: refetchLow } = useInventoryAlerts('low-stock');
    const { data: outOfStockAlerts, refetch: refetchOut } = useInventoryAlerts('out-of-stock');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    const handleSelectAll = (alerts: InventoryAlert[]) => {
        setSelectedProducts(alerts.map(a => a.productId));
    };

    const handleSelectProduct = (productId: number) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleCreatePurchaseOrder = () => {
        if (selectedProducts.length > 0) {
            // Navegar para criar ordem de compra
            console.log('Criar ordem de compra para:', selectedProducts);
        }
    };

    const handleGenerateReport = () => {
        // Gerar relatório de produtos com alerta
        console.log('Gerar relatório de alertas');
    };

    const getUrgencyBadge = (level: UrgencyLevel) => {
        const variants = {
            CRITICAL: 'destructive',
            HIGH: 'warning',
            MEDIUM: 'secondary',
            LOW: 'outline'
        } as const;

        return <Badge variant={variants[level]}>{level}</Badge>;
    };

    const criticalCount = (lowStockAlerts || []).filter(a => a.urgencyLevel === 'CRITICAL').length;
    const outOfStockCount = (outOfStockAlerts || []).length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Alertas de Estoque</h1>
                    <p className="text-muted-foreground">
                        Monitore produtos com estoque crítico ou baixo
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { refetchLow(); refetchOut(); }}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    <Button variant="outline" onClick={handleGenerateReport}>
                        <FileText className="mr-2 h-4 w-4" />
                        Relatório
                    </Button>
                    <Button
                        onClick={handleCreatePurchaseOrder}
                        disabled={selectedProducts.length === 0}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Criar Ordem de Compra ({selectedProducts.length})
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={criticalCount > 0 ? 'border-red-500' : ''}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Situação Crítica</p>
                                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Requer ação imediata
                                </p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {(lowStockAlerts || []).length}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Abaixo do mínimo
                                </p>
                            </div>
                            <TrendingDown className="h-10 w-10 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                                <p className="text-3xl font-bold">{outOfStockCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Produtos zerados
                                </p>
                            </div>
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Critical Alert Banner */}
            {criticalCount > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção Urgente!</AlertTitle>
                    <AlertDescription>
                        {criticalCount} produto(s) estão em situação crítica e precisam de reabastecimento imediato.
                        Produtos podem ficar indisponíveis em breve.
                    </AlertDescription>
                </Alert>
            )}

            {/* Alerts Table */}
            <Tabs defaultValue="low-stock" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="low-stock">
                        Estoque Baixo ({(lowStockAlerts || []).length})
                    </TabsTrigger>
                    <TabsTrigger value="out-of-stock">
                        Sem Estoque ({outOfStockCount})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="low-stock">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Produtos com Estoque Baixo</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectAll(lowStockAlerts || [])}
                                >
                                    Selecionar Todos
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Estoque Atual</TableHead>
                                        <TableHead>Mínimo</TableHead>
                                        <TableHead>Vendas/Dia</TableHead>
                                        <TableHead>Dias até Acabar</TableHead>
                                        <TableHead>Urgência</TableHead>
                                        <TableHead>Ação Sugerida</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockAlerts?.map((alert) => (
                                        <TableRow key={alert.productId}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(alert.productId)}
                                                    onChange={() => handleSelectProduct(alert.productId)}
                                                    className="h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{alert.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.productCode}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{alert.categoryName}</TableCell>
                                            <TableCell>
                        <span className={alert.currentStock <= alert.minStock ? 'text-red-600 font-semibold' : ''}>
                          {alert.currentStock}
                        </span>
                                            </TableCell>
                                            <TableCell>{alert.minStock}</TableCell>
                                            <TableCell>{alert.averageDailySales.toFixed(1)}</TableCell>
                                            <TableCell>
                                                {alert.daysUntilOutOfStock > 0
                                                    ? `${alert.daysUntilOutOfStock} dias`
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>{getUrgencyBadge(alert.urgencyLevel)}</TableCell>
                                            <TableCell>
                                                {alert.maxStock && (
                                                    <span className="text-sm text-blue-600">
                            Pedir {alert.maxStock - alert.currentStock} un
                          </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="out-of-stock">
                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos Sem Estoque</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Vendas Últimos 30 Dias</TableHead>
                                        <TableHead>Vendas/Dia</TableHead>
                                        <TableHead>Quantidade Sugerida</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outOfStockAlerts?.map((alert) => (
                                        <TableRow key={alert.productId}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(alert.productId)}
                                                    onChange={() => handleSelectProduct(alert.productId)}
                                                    className="h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{alert.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.productCode}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{alert.categoryName}</TableCell>
                                            <TableCell>{alert.salesLast30Days}</TableCell>
                                            <TableCell>{alert.averageDailySales.toFixed(1)}</TableCell>
                                            <TableCell>
                        <span className="text-blue-600 font-semibold">
                          {alert.maxStock || alert.minStock * 2} unidades
                        </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}