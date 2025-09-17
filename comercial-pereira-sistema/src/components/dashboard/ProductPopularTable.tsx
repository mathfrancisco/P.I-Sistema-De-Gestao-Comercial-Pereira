import {ProductSaleMetric} from "@/types/dashboard";
import {Skeleton} from "@/components/ui/loading";
import React from "react";
import {Activity, TrendingDown, TrendingUp,ArrowRight, Package} from "lucide-react";
import {Button} from "@/components/ui/button";

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
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton lines={5} height="3rem" />
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

    // Componente Sparkline simples
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
                            className="bg-blue-400 rounded-sm flex-1 opacity-80"
                            style={{ height: `${height}px` }}
                        />
                    );
                })}
            </div>
        );
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Esgotado</span>;
        } else if (stock < 10) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Baixo</span>;
        } else {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Em estoque</span>;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Produtos Populares</h3>
                    <p className="text-sm text-gray-500">Máximo 10 produtos mais vendidos</p>
                </div>
                <Button variant="secondary" size="sm" rightIcon={ArrowRight}>
                    Ver todos produtos
                </Button>
            </div>

            {/* Compact Table */}
            <div className="overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Produto</th>
                        <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Preço</th>
                        <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vendas</th>
                        <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estoque</th>
                        <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tendência</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {products.slice(0, 10).map((product, index) => (
                        <tr
                            key={product.productId}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => onProductClick?.(product.productId)}
                        >
                            <td className="py-4">
                                <div className="flex items-center space-x-3">
                                    {/* Thumbnail (40px) */}
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-5 h-5 text-gray-400" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 truncate">{product.productName}</p>
                                        <p className="text-sm text-gray-500">{product.productCode}</p>
                                    </div>
                                </div>
                            </td>

                            <td className="py-4 text-right">
                                <p className="font-medium text-gray-900">
                                    R$ {new Intl.NumberFormat('pt-BR').format(Number(product.totalRevenue))}
                                </p>
                            </td>

                            <td className="py-4 text-center">
                                <p className="font-medium text-gray-900">{product.salesCount}</p>
                            </td>

                            <td className="py-4 text-center">
                                {getStockBadge(product.totalQuantitySold)}
                            </td>

                            <td className="py-4">
                                <div className="flex items-center justify-center space-x-2">
                                    {/* Sparkline mostrando tendência */}
                                    <Sparkline data={[12, 15, 18, 14, 20, 25, product.salesCount]} />
                                    {getTrendIcon(product.trend)}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};