import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Package, Plus, Search, Grid, List, Upload, Download, ChevronRight, Filter
} from 'lucide-react';

interface ProductHeaderProps {
    onCreateProduct: () => void;
    onImport?: () => void;
    onExport?: () => void;
    filters: any;
    onFiltersChange: (filters: any) => void;
    summary?: {
        totalProducts: number;
        activeProducts: number;
        inactiveProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalValue: number;
    };
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    selectedCount?: number;
    onBulkAction?: (action: string) => void;
}

// Componente Button simples
const Button = ({
                    children,
                    variant = 'primary',
                    leftIcon: LeftIcon,
                    onClick,
                    ...props
                }: any) => {
    const baseClasses = 'inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]}`}
            onClick={onClick}
            {...props}
        >
            {LeftIcon && <LeftIcon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

// Componente Input simples
const Input = ({
                   placeholder,
                   leftIcon: LeftIcon,
                   value,
                   onChange,
                   className = '',
                   ...props
               }: any) => {
    return (
        <div className="relative">
            {LeftIcon && (
                <LeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full ${LeftIcon ? 'pl-10' : 'pl-3'} pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
                {...props}
            />
        </div>
    );
};

// Componente Select simples
const Select = ({
                    options,
                    value,
                    onChange,
                    placeholder,
                    ...props
                }: any) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...props}
        >
            {placeholder && (
                <option value="">{placeholder}</option>
            )}
            {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export const ProductHeader: React.FC<ProductHeaderProps> = React.memo(({
                                                                           onCreateProduct,
                                                                           onImport,
                                                                           onExport,
                                                                           filters,
                                                                           onFiltersChange,
                                                                           summary,
                                                                           viewMode,
                                                                           onViewModeChange,
                                                                           selectedCount = 0,
                                                                           onBulkAction
                                                                       }) => {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFiltersChange({ search: searchValue || undefined });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFiltersChange]);

    // Memoize options
    const statusOptions = useMemo(() => [
        { value: '', label: 'Todos os status' },
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
    ], []);

    const stockOptions = useMemo(() => [
        { value: '', label: 'Todos os estoques' },
        { value: 'hasStock', label: 'Com estoque' },
        { value: 'lowStock', label: 'Estoque baixo' },
        { value: 'noStock', label: 'Sem estoque' },
    ], []);

    // Callbacks
    const handleStockFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFiltersChange({
            hasStock: value === 'hasStock' ? true : undefined,
            lowStock: value === 'lowStock' ? true : undefined,
            noStock: value === 'noStock' ? true : undefined,
        });
    }, [onFiltersChange]);

    const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFiltersChange({
            isActive: value ? value === 'true' : undefined
        });
    }, [onFiltersChange]);

    const handlePriceFilter = useCallback((minPrice?: number, maxPrice?: number) => {
        onFiltersChange({ minPrice, maxPrice });
    }, [onFiltersChange]);

    // Get current stock filter value
    const currentStockFilter = useMemo(() => {
        if (filters.hasStock) return 'hasStock';
        if (filters.lowStock) return 'lowStock';
        if (filters.noStock) return 'noStock';
        return '';
    }, [filters.hasStock, filters.lowStock, filters.noStock]);

    return (
        <div className="bg-white border-b border-gray-200 p-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900">Produtos</span>
            </div>

            {/* Header principal */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                        <p className="text-sm text-gray-500">
                            {summary ? `${summary.activeProducts} de ${summary.totalProducts} produtos` : 'Carregando...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`px-3 py-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`px-3 py-2 rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {onImport && (
                        <Button variant="secondary" leftIcon={Upload} onClick={onImport}>
                            Import
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="secondary" leftIcon={Download} onClick={onExport}>
                            Export
                        </Button>
                    )}
                    <Button leftIcon={Plus} onClick={onCreateProduct}>
                        Novo Produto
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedCount > 0 && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-purple-700">
                        {selectedCount} produtos selecionados
                    </span>
                    <div className="flex space-x-2">
                        <Button variant="secondary" onClick={() => onBulkAction?.('export')}>
                            Export
                        </Button>
                        <Button variant="secondary" onClick={() => onBulkAction?.('changeCategory')}>
                            Alterar Categoria
                        </Button>
                        <Button variant="secondary" onClick={() => onBulkAction?.('updatePrice')}>
                            Atualizar Preço
                        </Button>
                        <button
                            onClick={() => onBulkAction?.('delete')}
                            className="px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Buscar por nome, código ou descrição..."
                            leftIcon={Search}
                            value={searchValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
                        />
                    </div>

                    <Select
                        placeholder="Status"
                        options={statusOptions}
                        value={filters.isActive !== undefined ? String(filters.isActive) : ''}
                        onChange={handleStatusFilterChange}
                    />

                    <Select
                        placeholder="Estoque"
                        options={stockOptions}
                        value={currentStockFilter}
                        onChange={handleStockFilterChange}
                    />
                </div>

                {/* Quick Filters */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <Filter className="w-4 h-4 mr-1" />
                        Mais filtros
                    </button>

                    <span className="text-sm text-gray-400">|</span>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Filtros rápidos:</span>
                        <button
                            onClick={() => handlePriceFilter(0, 50)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Até R$ 50
                        </button>
                        <button
                            onClick={() => handlePriceFilter(50, 200)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            R$ 50 - R$ 200
                        </button>
                        <button
                            onClick={() => handlePriceFilter(200, undefined)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Acima R$ 200
                        </button>
                        <button
                            onClick={() => onFiltersChange({ hasBarcode: true })}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Com código de barras
                        </button>
                    </div>
                </div>

                {/* Expandable filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço mínimo
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filters.minPrice || ''}
                                onChange={(e) => onFiltersChange({
                                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço máximo
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="999.99"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filters.maxPrice || ''}
                                onChange={(e) => onFiltersChange({
                                    maxPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => onFiltersChange({ minPrice: undefined, maxPrice: undefined })}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Limpar preços
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});