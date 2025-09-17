// components/products/ProductHeader.tsx
import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Search, Grid, List, Upload, Download, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { ProductFilters } from '@/types/product';

interface ProductHeaderProps {
    onCreateProduct: () => void;
    onImport?: () => void;
    onExport?: () => void;
    filters: ProductFilters;
    onFiltersChange: (filters: Partial<ProductFilters>) => void;
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

export const ProductHeader: React.FC<ProductHeaderProps> = ({
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFiltersChange({ search: searchValue });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFiltersChange]);

    const statusOptions = [
        { value: '', label: 'Todos os status' },
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
    ];

    const stockOptions = [
        { value: '', label: 'Todos os estoques' },
        { value: 'hasStock', label: 'Com estoque' },
        { value: 'lowStock', label: 'Estoque baixo' },
        { value: 'noStock', label: 'Sem estoque' },
    ];

    const handleStockFilterChange = (value: string) => {
        onFiltersChange({
            hasStock: value === 'hasStock' ? true : undefined,
            lowStock: value === 'lowStock' ? true : undefined,
            noStock: value === 'noStock' ? true : undefined,
        });
    };

    return (
        <div className="bg-white border-b border-gray-200 p-6">
            {/* Breadcrumb navegável */}
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
                            Showing {summary?.activeProducts || 0} of {summary?.totalProducts || 0} products
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
                        <Button size="sm" variant="secondary" onClick={() => onBulkAction?.('export')}>
                            Export
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onBulkAction?.('changeCategory')}>
                            Alterar Categoria
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onBulkAction?.('updatePrice')}>
                            Atualizar Preço
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onBulkAction?.('delete')}>
                            Excluir
                        </Button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                    <Input
                        placeholder="Buscar por nome, código ou descrição..."
                        leftIcon={Search}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <Select
                    placeholder="Status"
                    options={statusOptions}
                    value={filters.isActive !== undefined ? String(filters.isActive) : ''}
                    onChange={(e) => onFiltersChange({ isActive: e.target.value ? e.target.value === 'true' : undefined })}
                />

                <Select
                    placeholder="Estoque"
                    options={stockOptions}
                    value={
                        filters.hasStock ? 'hasStock' :
                            filters.lowStock ? 'lowStock' :
                                filters.noStock ? 'noStock' : ''
                    }
                    onChange={(e) => handleStockFilterChange(e.target.value)}
                />
            </div>

            {/* Filtros rápidos em chips */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Filtros rápidos:</span>
                <button
                    onClick={() => onFiltersChange({ minPrice: 0, maxPrice: 50 })}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                    Até R$ 50
                </button>
                <button
                    onClick={() => onFiltersChange({ minPrice: 50, maxPrice: 200 })}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                    R$ 50 - R$ 200
                </button>
                <button
                    onClick={() => onFiltersChange({ minPrice: 200, maxPrice: undefined })}
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
    );
};