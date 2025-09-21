// components/customers/CustomerPurchaseHistory.tsx
import React, { useState } from 'react';
import {
    ShoppingCart, Calendar, Package,
    ChevronDown, ChevronUp, Filter, Download,
    CheckCircle, XCircle, AlertCircle, Clock,
     ChevronRight, User
} from 'lucide-react';
import { useCustomerSales } from '@/lib/hooks/useCustomers';

interface CustomerPurchaseHistoryProps {
    customerId: number;
    customerName: string;
    showSummary?: boolean;
    compact?: boolean;
    className?: string;
}

interface SaleStatus {
    PENDING: { color: string; icon: any; label: string };
    COMPLETED: { color: string; icon: any; label: string };
    CANCELLED: { color: string; icon: any; label: string };
    REFUNDED: { color: string; icon: any; label: string };
}

// Define the status type for proper typing
type StatusType = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export const CustomerPurchaseHistory: React.FC<CustomerPurchaseHistoryProps> = ({
                                                                                    customerId,
                                                                                    customerName,
                                                                                    showSummary = true,
                                                                                    compact = false,
                                                                                    className = ''
                                                                                }) => {
    const [expandedSales, setExpandedSales] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });

    const {
        sales,
        pagination,
        summary,
        loading,
        error,
        filters,
        updateFilters,
        refresh
    } = useCustomerSales(customerId);

    // Status configurations
    const saleStatusConfig: SaleStatus = {
        PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
        COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída' },
        CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' },
        REFUNDED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Reembolsada' }
    };

    const toggleSaleExpansion = (saleId: number) => {
        const newExpanded = new Set(expandedSales);
        if (newExpanded.has(saleId)) {
            newExpanded.delete(saleId);
        } else {
            newExpanded.add(saleId);
        }
        setExpandedSales(newExpanded);
    };

    const applyDateFilter = () => {
        updateFilters({
            dateFrom: dateRange.from ? new Date(dateRange.from) : undefined,
            dateTo: dateRange.to ? new Date(dateRange.to) : undefined,
            page: 1
        });
        setShowFilters(false);
    };

    const clearFilters = () => {
        setDateRange({ from: '', to: '' });
        updateFilters({
            dateFrom: undefined,
            dateTo: undefined,
            status: undefined,
            page: 1
        });
    };

    const loadMore = () => {
        if (pagination.hasNextPage) {
            updateFilters({ page: pagination.page + 1 });
        }
    };

    const exportHistory = () => {
        // Implementar exportação
        console.log('Exportando histórico de compras...');
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (date: string | Date) => {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper function to handle status change with proper typing
    const handleStatusChange = (value: string) => {
        if (value === '') {
            updateFilters({ status: undefined });
        } else {
            // Cast to the proper status type after validation
            const validStatuses: StatusType[] = ['DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
            if (validStatuses.includes(value as StatusType)) {
                updateFilters({ status: value as StatusType });
            }
        }
    };

    if (error) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="text-center text-red-600">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Erro ao carregar histórico de compras</p>
                    <button
                        onClick={refresh}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Histórico de Compras
                            </h3>
                            <p className="text-sm text-gray-500">
                                {customerName} • {pagination.total} transações
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                                showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>

                        <button
                            onClick={exportHistory}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Inicial
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Final
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos os status</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="COMPLETED">Concluída</option>
                                    <option value="CANCELLED">Cancelada</option>
                                    <option value="REFUNDED">Reembolsada</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={applyDateFilter}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Aplicar
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {showSummary && !compact && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {summary.totalSales}
                            </div>
                            <div className="text-sm text-gray-500">Total de Vendas</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                R$ {summary.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-500">Valor Total</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                R$ {summary.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-500">Ticket Médio</div>
                        </div>

                        <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">
                                R$ {summary.maxOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-500">Maior Compra</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Timeline */}
            <div className="p-6">
                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && sales.length === 0 && (
                    <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhuma compra encontrada
                        </h3>
                        <p className="text-gray-500">
                            Este cliente ainda não realizou compras no período selecionado
                        </p>
                    </div>
                )}

                {!loading && sales.length > 0 && (
                    <div className="space-y-4">
                        {sales.map((sale: any, index: number) => {
                            const isExpanded = expandedSales.has(sale.id);
                            const statusConfig = saleStatusConfig[sale.status as keyof SaleStatus];
                            const StatusIcon = statusConfig?.icon || CheckCircle;

                            return (
                                <div
                                    key={sale.id}
                                    className="relative border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                >
                                    {/* Timeline connector */}
                                    {index < sales.length - 1 && (
                                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200" />
                                    )}

                                    {/* Sale header */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleSaleExpansion(sale.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Status icon */}
                                            <div className={`w-12 h-12 rounded-full ${statusConfig?.color || 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                                                <StatusIcon className="w-6 h-6" />
                                            </div>

                                            {/* Sale info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            Venda #{sale.id}
                                                        </h4>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                              {statusConfig?.label || sale.status}
                            </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(sale.saleDate)} às {formatTime(sale.saleDate)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Package className="w-4 h-4" />
                                                        {sale.itemCount} {sale.itemCount === 1 ? 'item' : 'itens'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {sale.user.name}
                                                    </div>
                                                </div>

                                                {sale.notes && (
                                                    <p className="mt-2 text-sm text-gray-600 italic">
                                                        "{sale.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded content */}
                                    {isExpanded && sale.items && (
                                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <h5 className="text-sm font-medium text-gray-900 mb-3">
                                                Itens da Venda
                                            </h5>

                                            <div className="space-y-2">
                                                {sale.items.map((item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {item.product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Código: {item.product.code} • Categoria: {item.product.category.name}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-500">
                                                                {item.quantity}x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="font-medium text-gray-900">
                                                                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                            {item.discount > 0 && (
                                                                <div className="text-xs text-green-600">
                                                                    Desconto: R$ {item.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Sale totals */}
                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="text-gray-900">
                              R$ {(sale.total + sale.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                                                    </div>
                                                    {sale.discount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Desconto:</span>
                                                            <span className="text-green-600">
                                -R$ {sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                                                        </div>
                                                    )}
                                                    {sale.tax > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Impostos:</span>
                                                            <span className="text-gray-900">
                                R$ {sale.tax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                                        <span className="text-gray-900">Total:</span>
                                                        <span className="text-gray-900">
                              R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load more */}
                {!loading && pagination.hasNextPage && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={loadMore}
                            className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                        >
                            Carregar mais vendas
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};