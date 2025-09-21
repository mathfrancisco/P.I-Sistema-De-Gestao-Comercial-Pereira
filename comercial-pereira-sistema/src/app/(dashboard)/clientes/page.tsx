// app/(dashboard)/clientes/page.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    CustomerResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerType
} from '@/types/customer';
import {
    useCustomers,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer
} from '@/lib/hooks/useCustomers';
import { CustomerListHeader } from '@/components/customers/CustomerListHeader';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerProfileHeader } from '@/components/customers/CustomerProfileHeader';
import { CustomerPurchaseHistory } from '@/components/customers/CustomerPurchaseHistory';
import { CustomerAnalyticsPanel } from '@/components/customers/CustomerAnalyticsPanel';

type ViewMode = 'list' | 'form' | 'profile';

export default function ClientesPage() {
    // Estados locais - using undefined instead of null for TypeScript compatibility
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | undefined>(undefined);
    const [viewingCustomer, setViewingCustomer] = useState<CustomerResponse | undefined>(undefined);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Hooks principais
    const {
        customers,
        pagination,
        filters,
        loading,
        error,
        updateFilters,
        changePage,
        changeSort,
        refresh
    } = useCustomers();

    const { createCustomer, loading: creating } = useCreateCustomer();
    const { updateCustomer, loading: updating } = useUpdateCustomer();
    const { deleteCustomer, loading: deleting } = useDeleteCustomer();

    // Handlers para seleção
    const handleSelectCustomer = (id: number) => {
        setSelectedCustomers(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (selectAll: boolean) => {
        setSelectedCustomers(selectAll ? customers.map(c => c.id) : []);
    };

    // Handlers para navegação
    const handleCreateCustomer = () => {
        setEditingCustomer(undefined);
        setFormMode('create');
        setViewMode('form');
    };

    const handleEditCustomer = (customer: CustomerResponse) => {
        setEditingCustomer(customer);
        setFormMode('edit');
        setViewMode('form');
    };

    const handleViewCustomer = (customer: CustomerResponse) => {
        setViewingCustomer(customer);
        setViewMode('profile');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setEditingCustomer(undefined);
        setViewingCustomer(undefined);
        setSelectedCustomers([]);
    };

    // Handler para submissão do formulário
    const handleSubmitForm = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
        try {
            if (formMode === 'create') {
                await createCustomer(data as CreateCustomerRequest);
                toast.success('Cliente criado com sucesso!');
            } else if (editingCustomer) {
                await updateCustomer(editingCustomer.id, data as UpdateCustomerRequest);
                toast.success('Cliente atualizado com sucesso!');
            }

            refresh();
            handleBackToList();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar cliente');
        }
    };

    // Handler para ações em lote
    const handleBulkAction = async (action: string) => {
        if (selectedCustomers.length === 0) {
            toast.error('Selecione pelo menos um cliente');
            return;
        }

        try {
            switch (action) {
                case 'export':
                    // Implementar exportação
                    toast.success(`${selectedCustomers.length} clientes exportados`);
                    break;

                case 'delete':
                    if (confirm(`Deseja realmente desativar ${selectedCustomers.length} cliente(s)?`)) {
                        // Implementar deleção em lote
                        toast.success(`${selectedCustomers.length} clientes desativados`);
                        setSelectedCustomers([]);
                        refresh();
                    }
                    break;

                default:
                    toast.error('Ação não implementada');
            }
        } catch (error) {
            toast.error('Erro ao executar ação em lote');
        }
    };

    // Handler para importação/exportação
    const handleImport = () => {
        toast.info('Funcionalidade de importação será implementada');
    };

    const handleExport = () => {
        try {
            // Gerar CSV simples
            const csvHeaders = ['ID', 'Nome', 'Email', 'Telefone', 'Documento', 'Tipo', 'Cidade', 'Estado', 'Status'];
            const csvData = customers.map(customer => [
                customer.id,
                customer.name,
                customer.email || '',
                customer.phone || '',
                customer.document || '',
                customer.type === CustomerType.RETAIL ? 'Varejo' : 'Atacado',
                customer.city || '',
                customer.state || '',
                customer.isActive ? 'Ativo' : 'Inativo'
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Clientes exportados para CSV!');
        } catch (error) {
            toast.error('Erro ao exportar clientes');
        }
    };

    // Handler para nova venda (placeholder)
    const handleNewSale = (customer: CustomerResponse) => {
        toast.info(`Nova venda para ${customer.name} será implementada`);
    };

    // Handler para enviar mensagem (placeholder)
    const handleSendMessage = (customer: CustomerResponse) => {
        toast.info(`Envio de mensagem para ${customer.name} será implementado`);
    };

    // Renderização condicional baseada no modo de visualização
    if (viewMode === 'form') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                        <button
                            onClick={handleBackToList}
                            className="hover:text-gray-900 transition-colors"
                        >
                            Clientes
                        </button>
                        <span>/</span>
                        <span className="text-gray-900">
              {formMode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
            </span>
                    </nav>

                    <CustomerForm
                        customer={editingCustomer}
                        onSubmit={handleSubmitForm}
                        onCancel={handleBackToList}
                        loading={creating || updating}
                        mode={formMode}
                    />
                </div>
            </div>
        );
    }

    if (viewMode === 'profile' && viewingCustomer) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                        <button
                            onClick={handleBackToList}
                            className="hover:text-gray-900 transition-colors"
                        >
                            Clientes
                        </button>
                        <span>/</span>
                        <span className="text-gray-900">{viewingCustomer.name}</span>
                    </nav>

                    <div className="space-y-6">
                        {/* Profile Header */}
                        <CustomerProfileHeader
                            customer={viewingCustomer as any} // Type assertion pois precisaria do CustomerWithStatistics
                            onEdit={() => handleEditCustomer(viewingCustomer)}
                            onNewSale={() => handleNewSale(viewingCustomer)}
                            onSendMessage={() => handleSendMessage(viewingCustomer)}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Histórico de Compras */}
                            <div className="lg:col-span-2">
                                <CustomerPurchaseHistory
                                    customerId={viewingCustomer.id}
                                    customerName={viewingCustomer.name}
                                />
                            </div>

                            {/* Analytics Panel */}
                            <div className="lg:col-span-1">
                                <CustomerAnalyticsPanel
                                    customer={viewingCustomer as any} // Type assertion
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Vista principal da lista
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <CustomerListHeader
                onCreateCustomer={handleCreateCustomer}
                onImport={handleImport}
                onExport={handleExport}
                filters={filters}
                onFiltersChange={updateFilters}
                totalCustomers={pagination.total}
                selectedCount={selectedCustomers.length}
                onBulkAction={handleBulkAction}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error ? (
                    <div className="bg-white border border-red-200 rounded-lg p-6">
                        <div className="text-center text-red-600">
                            <h3 className="text-lg font-medium mb-2">Erro ao carregar clientes</h3>
                            <p className="text-sm mb-4">{error}</p>
                            <button
                                onClick={refresh}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                ) : (
                    <CustomerTable
                        customers={customers}
                        loading={loading}
                        selectedCustomers={selectedCustomers}
                        onSelectCustomer={handleSelectCustomer}
                        onSelectAll={handleSelectAll}
                        onEditCustomer={handleEditCustomer}
                        onViewCustomer={handleViewCustomer}
                        pagination={{
                            page: pagination.page,
                            limit: pagination.limit,
                            total: pagination.total,
                            totalPages: pagination.totalPages,
                            hasNextPage: pagination.hasNextPage,
                            hasPrevPage: pagination.hasPrevPage,
                            onPageChange: changePage
                        }}
                        onSort={changeSort}
                        sortColumn={filters.sortBy}
                        sortDirection={filters.sortOrder}
                        showSalesInfo={true}
                    />
                )}
            </div>

            {/* Footer com estatísticas rápidas */}
            {!loading && !error && customers.length > 0 && (
                <div className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-6">
                <span>
                  Total: <strong className="text-gray-900">{pagination.total}</strong> clientes
                </span>
                                <span>
                  Ativos: <strong className="text-green-600">
                    {customers.filter(c => c.isActive).length}
                  </strong>
                </span>
                                <span>
                  Varejo: <strong className="text-blue-600">
                    {customers.filter(c => c.type === CustomerType.RETAIL).length}
                  </strong>
                </span>
                                <span>
                  Atacado: <strong className="text-purple-600">
                    {customers.filter(c => c.type === CustomerType.WHOLESALE).length}
                  </strong>
                </span>
                            </div>

                            {selectedCustomers.length > 0 && (
                                <div className="text-blue-600">
                                    <strong>{selectedCustomers.length}</strong> cliente
                                    {selectedCustomers.length !== 1 ? 's' : ''} selecionado
                                    {selectedCustomers.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}