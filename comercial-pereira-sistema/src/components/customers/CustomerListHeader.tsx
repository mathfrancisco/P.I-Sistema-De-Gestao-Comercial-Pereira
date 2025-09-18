// components/customers/CustomerListHeader.tsx
import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Download, Upload, Filter, X, Building, User
} from 'lucide-react';
import { CustomerFilters, CustomerType } from '@/types/customer';
import { BRAZIL_STATES } from '@/types/customer';

interface CustomerListHeaderProps {
    onCreateCustomer: () => void;
    onImport?: () => void;
    onExport?: () => void;
    filters: CustomerFilters;
    onFiltersChange: (filters: Partial<CustomerFilters>) => void;
    totalCustomers?: number;
    selectedCount?: number;
    onBulkAction?: (action: string) => void;
}

export const CustomerListHeader: React.FC<CustomerListHeaderProps> = ({
                                                                          onCreateCustomer,
                                                                          onImport,
                                                                          onExport,
                                                                          filters,
                                                                          onFiltersChange,
                                                                          totalCustomers = 0,
                                                                          selectedCount = 0,
                                                                          onBulkAction
                                                                      }) => {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFiltersChange({ search: searchValue });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFiltersChange]);

    const clearFilters = () => {
        setSearchValue('');
        onFiltersChange({
            search: '',
            type: undefined,
            city: '',
            state: '',
            isActive: true,
            hasEmail: undefined,
            hasDocument: undefined,
            hasPurchases: undefined
        });
        setShowAdvancedFilters(false);
    };

    const hasActiveFilters = Boolean(
        filters.search ||
        filters.type ||
        filters.city ||
        filters.state ||
        filters.hasEmail !== undefined ||
        filters.hasDocument !== undefined ||
        filters.hasPurchases !== undefined ||
        filters.isActive === false
    );

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
                {/* Header principal */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                            <p className="text-sm text-gray-600">
                                {totalCustomers} cliente{totalCustomers !== 1 ? 's' : ''} encontrado{totalCustomers !== 1 ? 's' : ''}
                                {selectedCount > 0 && (
                                    <span className="ml-2 text-blue-600">
                    • {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
                  </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Ações em lote */}
                        {selectedCount > 0 && onBulkAction && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700">
                  {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
                </span>
                                <button
                                    onClick={() => onBulkAction('export')}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Exportar
                                </button>
                                <button
                                    onClick={() => onBulkAction('delete')}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Desativar
                                </button>
                            </div>
                        )}

                        {/* Botões de ação */}
                        {onImport && (
                            <button
                                onClick={onImport}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Upload className="w-4 h-4" />
                                Importar
                            </button>
                        )}

                        {onExport && (
                            <button
                                onClick={onExport}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                        )}

                        <button
                            onClick={onCreateCustomer}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <UserPlus className="w-4 h-4" />
                            Novo Cliente
                        </button>
                    </div>
                </div>

                {/* Filtros e busca */}
                <div className="space-y-4">
                    {/* Linha principal de filtros */}
                    <div className="flex items-center gap-4">
                        {/* Busca */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou documento..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtros rápidos de segmentação */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Tipo:</span>
                            <button
                                onClick={() => onFiltersChange({ type: undefined })}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    !filters.type
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => onFiltersChange({ type: CustomerType.RETAIL })}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    filters.type === CustomerType.RETAIL
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <User className="w-3 h-3" />
                                Varejo
                            </button>
                            <button
                                onClick={() => onFiltersChange({ type: CustomerType.WHOLESALE })}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    filters.type === CustomerType.WHOLESALE
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Building className="w-3 h-3" />
                                Atacado
                            </button>
                        </div>

                        {/* Botão filtros avançados */}
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                                showAdvancedFilters || hasActiveFilters
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            {hasActiveFilters && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {[
                      filters.search,
                      filters.type,
                      filters.city,
                      filters.state,
                      filters.hasEmail !== undefined && 'Email',
                      filters.hasDocument !== undefined && 'Documento',
                      filters.hasPurchases !== undefined && 'Compras',
                      filters.isActive === false && 'Inativos'
                  ].filter(Boolean).length}
                </span>
                            )}
                        </button>

                        {/* Limpar filtros */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                                <X className="w-4 h-4" />
                                Limpar
                            </button>
                        )}
                    </div>

                    {/* Filtros avançados */}
                    {showAdvancedFilters && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                                        onChange={(e) => onFiltersChange({
                                            isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Ativos</option>
                                        <option value="false">Inativos</option>
                                    </select>
                                </div>

                                {/* Cidade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Digite a cidade"
                                        value={filters.city || ''}
                                        onChange={(e) => onFiltersChange({ city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={filters.state || ''}
                                        onChange={(e) => onFiltersChange({ state: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos os estados</option>
                                        {BRAZIL_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro de email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <select
                                        value={filters.hasEmail === undefined ? '' : filters.hasEmail.toString()}
                                        onChange={(e) => onFiltersChange({
                                            hasEmail: e.target.value === '' ? undefined : e.target.value === 'true'
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Com email</option>
                                        <option value="false">Sem email</option>
                                    </select>
                                </div>

                                {/* Filtro de documento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Documento
                                    </label>
                                    <select
                                        value={filters.hasDocument === undefined ? '' : filters.hasDocument.toString()}
                                        onChange={(e) => onFiltersChange({
                                            hasDocument: e.target.value === '' ? undefined : e.target.value === 'true'
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Com documento</option>
                                        <option value="false">Sem documento</option>
                                    </select>
                                </div>

                                {/* Filtro de compras */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Histórico
                                    </label>
                                    <select
                                        value={filters.hasPurchases === undefined ? '' : filters.hasPurchases.toString()}
                                        onChange={(e) => onFiltersChange({
                                            hasPurchases: e.target.value === '' ? undefined : e.target.value === 'true'
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Com compras</option>
                                        <option value="false">Sem compras</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};