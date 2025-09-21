'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';

import { InventoryFilters } from '@/types/inventory';
import {useInventoryAlerts} from "@/lib/hooks/useInventoryAlerts";
import {useInventory} from "@/lib/hooks/useInventory";
import {useStockAdjustment} from "@/lib/hooks/useStockAdjustment";
import {StockDashboard} from "@/components/inventory/StockDashboard";
import {StockTable} from "@/components/inventory/StockTable";
import {StockAlertPanel} from "@/components/inventory/StockAlertPanel";
import {StockAdjustmentForm} from "@/components/inventory/StockAdjustmentForm";

export default function StockPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<string>('all');

    const filters: InventoryFilters = {
        search: searchTerm,
        categoryId: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
        lowStock: stockFilter === 'low',
        outOfStock: stockFilter === 'out',
        hasStock: stockFilter === 'normal',
    };

    const {
        inventory,
        pagination,
        isLoading,
        updateInventory,
        adjustStock,
        refetch
    } = useInventory(filters);

    const { data: alerts } = useInventoryAlerts();

    const {
        isOpen,
        selectedProduct,
        openAdjustment,
        closeAdjustment,
        adjustStock: performAdjustment
    } = useStockAdjustment();

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleExport = () => {
        // Implementar exportação de relatório
        console.log('Exportar relatório de estoque');
    };

    const handleCreateOrder = (productIds: number[]) => {
        // Navegar para criar pedido com produtos selecionados
        console.log('Criar pedido para produtos:', productIds);
    };

    const selectedProductData = inventory.find(i => i.productId === selectedProduct);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
                    <p className="text-muted-foreground">
                        Gerencie e monitore o estoque de produtos
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Dashboard */}
            <StockDashboard />

            {/* Main Content */}
            <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inventory">Inventário</TabsTrigger>
                    <TabsTrigger value="alerts">Alertas</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por nome ou código..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as Categorias</SelectItem>
                                        {/* Adicionar categorias dinamicamente */}
                                    </SelectContent>
                                </Select>
                                <Select value={stockFilter} onValueChange={setStockFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="low">Estoque Baixo</SelectItem>
                                        <SelectItem value="out">Sem Estoque</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos em Estoque</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StockTable
                                inventory={inventory}
                                onUpdate={(id, quantity) => updateInventory({ id, data: { quantity } })}
                                onAdjust={openAdjustment}
                            />
                            {pagination && pagination.hasNext && (
                                <div className="flex justify-center mt-4">
                                    <Button variant="outline">Carregar mais</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <StockAlertPanel
                        alerts={alerts || []}
                        onCreateOrder={handleCreateOrder}
                        onRefresh={refetch}
                    />
                </TabsContent>
            </Tabs>

            {/* Adjustment Form Modal */}
            <StockAdjustmentForm
                isOpen={isOpen}
                onClose={closeAdjustment}
                onSubmit={performAdjustment}
                productId={selectedProduct}
                currentStock={selectedProductData?.quantity}
                productName={selectedProductData?.product.name}
            />
        </div>
    );
}