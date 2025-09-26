// app/(dashboard)/vendas/page.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit2,
    X,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/utils';
import {
    useSales,
    useSaleActions
} from '@/lib/hooks/useSales';
import {
    formatSaleNumber,
    getSaleStatusLabel,
    getSaleStatusColor,
    SaleStatus
} from '@/types/sale';
import type { SaleResponse, SaleFilters } from '@/types/sale';
import {Sidebar} from "@/components/layout/sidebar";

interface SalesListHeaderProps {
    onNewSale: () => void;
    onExport?: () => void;
    filters: SaleFilters;
    onFiltersChange: (filters: Partial<SaleFilters>) => void;
    summary: {
        totalSales: number;
        totalRevenue: number;
        averageOrderValue: number;
        totalQuantity: number;
    };
    selectedCount?: number;
    onBulkAction?: (action: string) => void;
}

const SalesListHeader: React.FC<SalesListHeaderProps> = ({
                                                             onNewSale,
                                                             onExport,
                                                             filters,
                                                             onFiltersChange,
                                                             summary,
                                                             selectedCount = 0,
                                                             onBulkAction
                                                         }) => {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }
    const handleNavigation = (href: string) => {
        console.log('Navegando para:', href)
        // Implementar navegação
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFiltersChange({ search: searchValue });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFiltersChange]);

    return (
        <div className="space-y-4">

            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                activeItem="/dashboard"
                onItemClick={handleNavigation}
            />
            {/* Header Principal */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                    <p className="text-gray-600 mt-1">
                        Gerencie todas as vendas da loja
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={onNewSale}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Venda
                    </Button>
                </div>
            </div>

            {/* Resumo de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Total de Vendas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {summary.totalSales}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>Faturamento</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                        R$ {summary.totalRevenue.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>Ticket Médio</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                        R$ {summary.averageOrderValue.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>Itens Vendidos</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">
                        {summary.totalQuantity}
                    </div>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                    {/* Busca */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por cliente, número da venda..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFiltersChange({ status: e.target.value as SaleStatus || undefined })}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">Todos os status</option>
                        <option value="DRAFT">Rascunho</option>
                        <option value="PENDING">Pendente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETED">Concluída</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="REFUNDED">Reembolsada</option>
                    </select>

                    {/* Advanced Filters Button */}
                    <Button
                        variant="outline"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={cn(showAdvancedFilters && 'bg-gray-100')}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>

                    {/* Export Button */}
                    {onExport && (
                        <Button variant="outline" onClick={onExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    )}
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de início
                                </label>
                                <Input
                                    type="date"
                                    value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                                    onChange={(e) => onFiltersChange({
                                        dateFrom: e.target.value ? new Date(e.target.value) : undefined
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data final
                                </label>
                                <Input
                                    type="date"
                                    value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                                    onChange={(e) => onFiltersChange({
                                        dateTo: e.target.value ? new Date(e.target.value) : undefined
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor mínimo
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={filters.minTotal || ''}
                                    onChange={(e) => onFiltersChange({
                                        minTotal: e.target.value ? parseFloat(e.target.value) : undefined
                                    })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onFiltersChange({
                                        dateFrom: undefined,
                                        dateTo: undefined,
                                        minTotal: undefined,
                                        maxTotal: undefined
                                    });
                                }}
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedCount > 0 && onBulkAction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedCount} venda(s) selecionada(s)
            </span>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onBulkAction('export')}
                            >
                                Exportar Selecionadas
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SaleCardProps {
    sale: SaleResponse;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    onView: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onComplete: () => void;
}

const SaleCard: React.FC<SaleCardProps> = ({
                                               sale,
                                               isSelected,
                                               onSelect,
                                               onView,
                                               onEdit,
                                               onCancel,
                                               onComplete
                                           }) => {
    const statusColor = getSaleStatusColor(sale.status);
    const canEdit = ['DRAFT', 'PENDING'].includes(sale.status);
    const canCancel = ['DRAFT', 'PENDING', 'CONFIRMED'].includes(sale.status);
    const canComplete = sale.status === 'CONFIRMED';

    return (
        <div className={cn(
            'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200',
            isSelected && 'ring-2 ring-blue-500 border-blue-500'
        )}>
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                />

                {/* Sale Info */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                                {formatSaleNumber(sale.id)}
                            </h3>
                            <span className={cn(
                                'px-2 py-1 text-xs font-medium rounded-full',
                                statusColor === 'gray' && 'bg-gray-100 text-gray-700',
                                statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700',
                                statusColor === 'blue' && 'bg-blue-100 text-blue-700',
                                statusColor === 'green' && 'bg-green-100 text-green-700',
                                statusColor === 'red' && 'bg-red-100 text-red-700',
                                statusColor === 'orange' && 'bg-orange-100 text-orange-700'
                            )}>
                {getSaleStatusLabel(sale.status)}
              </span>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                                R$ {sale.total.toFixed(2)}
                            </div>
                            {sale.discount && sale.discount > 0 && (
                                <div className="text-xs text-red-600">
                                    Desc: R$ {sale.discount.toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>Cliente: {sale.customer.name}</span>
                            <span>Vendedor: {sale.user.name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Data: {new Date(sale.saleDate).toLocaleDateString('pt-BR')}</span>
                            <span>Itens: {sale._count?.items || 0}</span>
                        </div>

                        {sale.notes && (
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                                {sale.notes}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="outline" onClick={onView}>
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                        </Button>

                        {canEdit && (
                            <Button size="sm" variant="outline" onClick={onEdit}>
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editar
                            </Button>
                        )}

                        {canComplete && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={onComplete}
                            >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Finalizar
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                onClick={onCancel}
                            >
                                <X className="w-3 h-3 mr-1" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function VendasPage() {
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Hooks
    const {
        sales,
        pagination,
        filters,
        summary,
        loading,
        error,
        updateFilters,
        changePage,
        refresh
    } = useSales();

    const { completeSale, cancelSale, loading: actionLoading } = useSaleActions();

    // Handlers
    const handleNewSale = () => {
        window.location.href = '/pdv';
    };

    const handleSelectSale = (saleId: number, selected: boolean) => {
        setSelectedSales(prev =>
            selected
                ? [...prev, saleId]
                : prev.filter(id => id !== saleId)
        );
    };

    const handleSelectAll = (selectAll: boolean) => {
        setSelectedSales(selectAll ? sales.map(sale => sale.id) : []);
    };

    const handleViewSale = (sale: SaleResponse) => {
        // Navigate to sale detail page
        window.location.href = `/vendas/${sale.id}`;
    };

    const handleEditSale = (sale: SaleResponse) => {
        // Navigate to sale edit page
        window.location.href = `/vendas/${sale.id}/edit`;
    };

    const handleCompleteSale = async (sale: SaleResponse) => {
        try {
            await completeSale(sale.id);
            refresh();
        } catch (error) {
            console.error('Error completing sale:', error);
        }
    };

    const handleCancelSale = async (sale: SaleResponse) => {
        if (confirm(`Tem certeza que deseja cancelar a venda ${formatSaleNumber(sale.id)}?`)) {
            try {
                await cancelSale(sale.id);
                refresh();
            } catch (error) {
                console.error('Error canceling sale:', error);
            }
        }
    };

    const handleExport = () => {
        toast.info('Função de exportação em desenvolvimento');
    };

    const handleBulkAction = (action: string) => {
        if (action === 'export') {
            toast.info(`Exportando ${selectedSales.length} vendas selecionadas`);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Erro ao carregar vendas
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={refresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <SalesListHeader
                    onNewSale={handleNewSale}
                    onExport={handleExport}
                    filters={filters}
                    onFiltersChange={updateFilters}
                    summary={summary}
                    selectedCount={selectedSales.length}
                    onBulkAction={handleBulkAction}
                />

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando vendas...</p>
                        </div>
                    </div>
                ) : sales.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhuma venda encontrada
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comece criando sua primeira venda ou ajuste os filtros
                        </p>
                        <Button onClick={handleNewSale}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Venda
                        </Button>
                    </div>
                ) : (
                    // Sales List
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {pagination.total} vendas encontradas
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSales.length === sales.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600">Selecionar todas</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {sales.map((sale) => (
                                <SaleCard
                                    key={sale.id}
                                    sale={sale}
                                    isSelected={selectedSales.includes(sale.id)}
                                    onSelect={(selected) => handleSelectSale(sale.id, selected)}
                                    onView={() => handleViewSale(sale)}
                                    onEdit={() => handleEditSale(sale)}
                                    onCancel={() => handleCancelSale(sale)}
                                    onComplete={() => handleCompleteSale(sale)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => changePage(pagination.page - 1)}
                                    disabled={!pagination.hasPrev}
                                >
                                    Anterior
                                </Button>

                                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages}
                </span>

                                <Button
                                    variant="outline"
                                    onClick={() => changePage(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                >
                                    Próxima
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}