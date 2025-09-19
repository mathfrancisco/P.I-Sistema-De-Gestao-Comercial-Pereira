// components/sales/ProductSearchPanel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Star, Package, AlertTriangle, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/lib/hooks/useProducts';
import type { ProductResponse } from '@/types/product';

interface ProductSearchPanelProps {
    onAddToCart: (product: ProductResponse, quantity?: number) => void;
    favorites?: number[];
    onToggleFavorite?: (productId: number) => void;
    className?: string;
}

interface ProductCardProps {
    product: ProductResponse;
    onAddToCart: (product: ProductResponse) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     product,
                                                     onAddToCart,
                                                     isFavorite = false,
                                                     onToggleFavorite
                                                 }) => {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= (product.minimumStock || 0);

    const stockBadge = useMemo(() => {
        if (isOutOfStock) {
            return (
                <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Sem estoque
                </div>
            );
        }
        if (isLowStock) {
            return (
                <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Baixo
                </div>
            );
        }
        return null;
    }, [isOutOfStock, isLowStock]);

    return (
        <div className={cn(
            'relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200',
            isOutOfStock ? 'opacity-60' : 'hover:border-blue-300'
        )}>
            {stockBadge}

            {/* Favorite Button */}
            {onToggleFavorite && (
                <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={cn(
                        'absolute top-2 left-2 p-1.5 rounded-full transition-colors',
                        isFavorite
                            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-yellow-500'
                    )}
                >
                    <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                </button>
            )}

            {/* Product Image */}
            <div className="w-full h-24 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                    />
                ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                <p className="text-xs text-gray-500">
                    Código: {product.code}
                </p>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
            <span className="font-bold text-green-600">
              R$ {product.price.toFixed(2)}
            </span>
                    </div>

                    <div className="text-xs text-gray-500">
                        Est: {product.stock}
                    </div>
                </div>

                {/* Category */}
                {product.category && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {product.category.name}
                    </div>
                )}

                {/* Add to Cart Button */}
                <Button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className={cn(
                        'w-full text-xs h-8',
                        isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    )}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                </Button>
            </div>
        </div>
    );
};

const CategoryFilter: React.FC<{
    categories: Array<{ id: number; name: string; count?: number }>;
    activeCategory: number | null;
    onCategoryChange: (categoryId: number | null) => void;
}> = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            <button
                onClick={() => onCategoryChange(null)}
                className={cn(
                    'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                    activeCategory === null
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                )}
            >
                Todos
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                        'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                        activeCategory === category.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    )}
                >
                    {category.name}
                    {category.count && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-white rounded-full">
              {category.count}
            </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export const ProductSearchPanel: React.FC<ProductSearchPanelProps> = ({
                                                                          onAddToCart,
                                                                          favorites = [],
                                                                          onToggleFavorite,
                                                                          className
                                                                      }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const {
        products,
        pagination,
        updateFilters,
        changePage,
        isLoading
    } = useProducts({
        categoryId: activeCategory || undefined,
        search: searchTerm,
        hasStock: true // Only show products with stock in POS
    });

    // Mock categories - in real app, this would come from useCategories hook
    const mockCategories = [
        { id: 1, name: 'Cosméticos', count: 45 },
        { id: 2, name: 'Ferragens', count: 32 },
        { id: 3, name: 'Papelaria', count: 28 },
        { id: 4, name: 'Material Elétrico', count: 18 },
        { id: 5, name: 'Embalagens', count: 25 }
    ];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search: searchTerm, page: 1 });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, updateFilters]);

    const filteredProducts = useMemo(() => {
        if (!showFavoritesOnly) return products;
        return products.filter(product => favorites.includes(product.id));
    }, [products, favorites, showFavoritesOnly]);

    const favoriteProducts = useMemo(() => {
        return products.filter(product => favorites.includes(product.id));
    }, [products, favorites]);

    return (
        <div className={cn('flex flex-col h-full bg-white', className)}>
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                                showFavoritesOnly
                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            )}
                        >
                            <Star className={cn('w-4 h-4', showFavoritesOnly && 'fill-current')} />
                            Favoritos ({favorites.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-1 border border-gray-200 rounded-md">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-1.5 rounded-l-md transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-1.5 rounded-r-md transition-colors',
                                viewMode === 'list'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            {!showFavoritesOnly && (
                <div className="px-4 py-3 border-b border-gray-200">
                    <CategoryFilter
                        categories={mockCategories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>
            )}

            {/* Favorites Section (when not filtered) */}
            {!showFavoritesOnly && favoriteProducts.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800 mb-3">Produtos Favoritos</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {favoriteProducts.slice(0, 4).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                isFavorite={true}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="text-sm">
                            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                        </p>
                    </div>
                ) : (
                    <div className="p-4">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={onAddToCart}
                                        isFavorite={favorites.includes(product.id)}
                                        onToggleFavorite={onToggleFavorite}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm text-gray-900 truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {product.code} • Est: {product.stock}
                                            </p>
                                            <p className="text-sm font-bold text-green-600">
                                                R$ {product.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => onAddToCart(product)}
                                            disabled={product.stock <= 0}
                                            size="sm"
                                            className="flex-shrink-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => changePage(pagination.page - 1)}
                                    disabled={!pagination.hasPrev}
                                >
                                    Anterior
                                </Button>

                                <span className="text-sm text-gray-600">
                  {pagination.page} de {pagination.pages}
                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => changePage(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                >
                                    Próximo
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
