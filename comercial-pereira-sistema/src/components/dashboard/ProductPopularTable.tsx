import React, { useState } from 'react';
import {
    Package, TrendingUp, TrendingDown, Activity,
    ArrowRight, Eye, MoreHorizontal, Star
} from 'lucide-react';

// ============================================
// SKELETON LOADER
// ============================================
interface SkeletonProps {
    lines?: number;
    height?: string;
    width?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ lines = 1, height = "1rem", width = "100%" }) => {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-200 rounded"
                    style={{ height, width: i === lines - 1 ? "75%" : width }}
                />
            ))}
        </div>
    );
};

// ============================================
// PRODUCT POPULAR TABLE - MELHORADO
// ============================================
interface ProductSaleMetric {
    productId: number;
    productName: string;
    productCode: string;
    categoryName: string;
    totalQuantitySold: number;
    totalRevenue: number | string;
    salesCount: number;
    averageQuantityPerSale: number;
    lastSaleDate: Date;
    trend: 'UP' | 'DOWN' | 'STABLE';
}

interface ProductPopularTableProps {
    products: ProductSaleMetric[];
    loading?: boolean;
    onProductClick?: (productId: number) => void;
}

export const ProductPopularTable: React.FC<ProductPopularTableProps> = ({
                                                                                    products,
                                                                                    loading = false,
                                                                                    onProductClick
                                                                                }) => {
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton width="200px" height="1.5rem" />
                    <Skeleton width="120px" height="2rem" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton width="40px" height="40px" />
                            <div className="flex-1 space-y-2">
                                <Skeleton width="60%" height="1rem" />
                                <Skeleton width="40%" height="0.75rem" />
                            </div>
                            <Skeleton width="80px" height="1rem" />
                            <Skeleton width="60px" height="1rem" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
        switch (trend) {
            case 'UP':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'DOWN':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        return (
            <div className="flex items-end space-x-px h-8 w-16">
                {data.map((value, index) => {
                    const height = ((value - min) / range) * 24 + 4;
                    return (
                        <div
                            key={index}
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm flex-1 opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${height}px` }}
                        />
                    );
                })}
            </div>
        );
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">Esgotado</span>;
        } else if (stock < 10) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Baixo</span>;
        } else {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Em estoque</span>;
        }
    };

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                    <p className="text-gray-500">Não há dados de vendas disponíveis para o período selecionado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                        Produtos Populares
                    </h3>
                    <p className="text-sm text-gray-500">Top {products.length} produtos mais vendidos</p>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Tabela
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'cards'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cards
                        </button>
                    </div>

                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
                        Ver todos
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Produto</th>
                            <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Receita</th>
                            <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vendas</th>
                            <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estoque</th>
                            <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tendência</th>
                            <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {products.slice(0, 10).map((product, index) => (
                            <tr
                                key={product.productId}
                                className="hover:bg-gray-50 transition-colors group"
                            >
                                <td className="py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors">
                                                {product.productName}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <p className="text-sm text-gray-500">{product.productCode}</p>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                        {product.categoryName}
                                                    </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 text-right">
                                    <p className="font-semibold text-gray-900">
                                        R$ {new Intl.NumberFormat('pt-BR').format(Number(product.totalRevenue))}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {product.salesCount} vendas
                                    </p>
                                </td>

                                <td className="py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <p className="font-medium text-gray-900">{product.totalQuantitySold}</p>
                                        <p className="text-xs text-gray-500">unidades</p>
                                    </div>
                                </td>

                                <td className="py-4 text-center">
                                    {getStockBadge(product.totalQuantitySold)}
                                </td>

                                <td className="py-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Sparkline data={[12, 15, 18, 14, 20, 25, product.salesCount]} />
                                        {getTrendIcon(product.trend)}
                                    </div>
                                </td>

                                <td className="py-4 text-center">
                                    <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onProductClick?.(product.productId)}
                                            className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                            title="Ver detalhes"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.slice(0, 10).map((product, index) => (
                        <div
                            key={product.productId}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => onProductClick?.(product.productId)}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{product.productName}</h4>
                                    <p className="text-sm text-gray-500">{product.productCode} • {product.categoryName}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                R$ {new Intl.NumberFormat('pt-BR').format(Number(product.totalRevenue))}
                                            </p>
                                            <p className="text-xs text-gray-500">{product.salesCount} vendas</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Sparkline data={[12, 15, 18, 14, 20, 25, product.salesCount]} />
                                            {getTrendIcon(product.trend)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};