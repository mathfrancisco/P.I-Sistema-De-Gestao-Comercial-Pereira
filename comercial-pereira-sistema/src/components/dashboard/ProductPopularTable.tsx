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

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Produtos Populares</h3>
                    <p className="text-sm text-gray-500">Top 10 produtos mais vendidos</p>
                </div>
                <Button variant="secondary" size="sm" rightIcon={ArrowRight}>
                    Ver todos
                </Button>
            </div>

            <div className="space-y-3">
                {products.slice(0, 10).map((product, index) => (
                    <div
                        key={product.productId}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => onProductClick?.(product.productId)}
                    >
                        <div className="flex items-center space-x-4">
                            {/* Ranking */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {index + 1}
                            </div>

                            {/* Product Image Placeholder */}
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Product Info */}
                            <div>
                                <p className="font-medium text-gray-900">{product.productName}</p>
                                <p className="text-sm text-gray-500">{product.productCode} • {product.categoryName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            {/* Sales */}
                            <div className="text-right">
                                <p className="font-medium text-gray-900">{product.salesCount} vendas</p>
                                <p className="text-sm text-gray-500">
                                    R$ {new Intl.NumberFormat('pt-BR').format(product.totalRevenue)}
                                </p>
                            </div>

                            {/* Stock Badge */}
                            <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {product.totalQuantitySold} un
                </span>
                                {getTrendIcon(product.trend)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};