// components/customers/CustomerTable.tsx
import React, { useState } from 'react';
import {
    Eye, Edit, MoreVertical, Phone, Mail, MapPin,
    User, Building, CheckCircle, XCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { CustomerResponse, CustomerType, formatDocument } from '@/types/customer';

interface CustomerTableProps {
    customers: CustomerResponse[];
    loading?: boolean;
    selectedCustomers?: number[];
    onSelectCustomer?: (id: number) => void;
    onSelectAll?: (selectAll: boolean) => void;
    onEditCustomer: (customer: CustomerResponse) => void;
    onViewCustomer: (customer: CustomerResponse) => void;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        onPageChange: (page: number) => void;
    };
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    showSalesInfo?: boolean;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
                                                                customers,
                                                                loading,
                                                                selectedCustomers = [],
                                                                onSelectCustomer,
                                                                onSelectAll,
                                                                onEditCustomer,
                                                                onViewCustomer,
                                                                pagination,
                                                                onSort,
                                                                sortColumn,
                                                                sortDirection,
                                                                showSalesInfo = true
                                                            }) => {
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    // Função para gerar avatar com iniciais
    const getCustomerAvatar = (name: string) => {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
        ];

        const colorIndex = name.length % colors.length;

        return (
            <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-medium text-sm`}>
                {initials}
            </div>
        );
    };

    const handleSort = (column: string) => {
        if (!onSort) return;

        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(column, newDirection);
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const handleSelectAll = (checked: boolean) => {
        if (onSelectAll) {
            onSelectAll(checked);
        }
    };

    const isAllSelected = customers.length > 0 && selectedCustomers.length === customers.length;
    const isPartiallySelected = selectedCustomers.length > 0 && selectedCustomers.length < customers.length;

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/6" />
                                </div>
                                <div className="w-24 h-4 bg-gray-200 rounded" />
                                <div className="w-20 h-6 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum cliente encontrado
                </h3>
                <p className="text-gray-500">
                    Tente ajustar os filtros ou criar um novo cliente
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {/* Checkbox */}
                        {onSelectCustomer && (
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(input) => {
                                        if (input) input.indeterminate = isPartiallySelected;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                        )}

                        {/* Cliente */}
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center gap-1">
                                Cliente
                                <span className="text-gray-400">{getSortIcon('name')}</span>
                            </div>
                        </th>

                        {/* Tipo */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                        </th>

                        {/* Documento */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documento
                        </th>

                        {/* Contato */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contato
                        </th>

                        {/* Localização */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Localização
                        </th>

                        {/* Vendas (se habilitado) */}
                        {showSalesInfo && (
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('lastPurchase')}
                            >
                                <div className="flex items-center gap-1">
                                    Vendas
                                    <span className="text-gray-400">{getSortIcon('lastPurchase')}</span>
                                </div>
                            </th>
                        )}

                        {/* Status */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>

                        {/* Ações */}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer: any) => (
                        <tr
                            key={customer.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            {/* Checkbox */}
                            {onSelectCustomer && (
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedCustomers.includes(customer.id)}
                                        onChange={() => onSelectCustomer(customer.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                            )}

                            {/* Cliente */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    {getCustomerAvatar(customer.name)}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {customer.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: {customer.id}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Tipo */}
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.type === CustomerType.RETAIL
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                  }`}>
                    {customer.type === CustomerType.RETAIL ? (
                        <>
                            <User className="w-3 h-3" />
                            Varejo
                        </>
                    ) : (
                        <>
                            <Building className="w-3 h-3" />
                            Atacado
                        </>
                    )}
                  </span>
                            </td>

                            {/* Documento */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {customer.document ? formatDocument(customer.document) : '--'}
                                </div>
                            </td>

                            {/* Contato */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                    {customer.email && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Mail className="w-3 h-3" />
                                            <a
                                                href={`mailto:${customer.email}`}
                                                className="hover:text-blue-600 hover:underline"
                                            >
                                                {customer.email}
                                            </a>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Phone className="w-3 h-3" />
                                            <a
                                                href={`tel:${customer.phone}`}
                                                className="hover:text-blue-600 hover:underline"
                                            >
                                                {customer.phone}
                                            </a>
                                        </div>
                                    )}
                                    {!customer.email && !customer.phone && (
                                        <span className="text-sm text-gray-400">--</span>
                                    )}
                                </div>
                            </td>

                            {/* Localização */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {customer.city && customer.state ? (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            {customer.city}, {customer.state}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">--</span>
                                    )}
                                </div>
                            </td>

                            {/* Vendas */}
                            {showSalesInfo && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="text-gray-900 font-medium">
                                            {customer.salesCount || 0} venda{customer.salesCount !== 1 ? 's' : ''}
                                        </div>
                                        {customer.lastPurchase && (
                                            <div className="text-gray-500">
                                                R$ {customer.lastPurchase.amount.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            )}

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.isActive ? (
                        <>
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3" />
                            Inativo
                        </>
                    )}
                  </span>
                            </td>

                            {/* Ações */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onViewCustomer(customer)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEditCustomer(customer)}
                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    {/* Menu de ações */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActionMenuOpen(
                                                actionMenuOpen === customer.id ? null : customer.id
                                            )}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {actionMenuOpen === customer.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            onViewCustomer(customer);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver perfil
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onEditCustomer(customer);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Editar
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1" />
                                                    <button
                                                        onClick={() => {
                                                            // Implementar nova venda
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Nova venda
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} até{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                        {pagination.total} clientes
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => pagination.onPageChange(page)}
                                        className={`px-3 py-1 text-sm rounded ${
                                            pagination.page === page
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {pagination.totalPages > 5 && (
                                <>
                                    <span className="px-2 text-gray-500">...</span>
                                    <button
                                        onClick={() => pagination.onPageChange(pagination.totalPages)}
                                        className={`px-3 py-1 text-sm rounded ${
                                            pagination.page === pagination.totalPages
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pagination.totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};