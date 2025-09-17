// components/products/ProductCard.tsx
import React, { useState } from 'react';
import { Package, Eye, Edit, Copy } from 'lucide-react';
import type { ProductResponse } from '@/types/product';

interface ProductCardProps {
    product: ProductResponse;
    selected?: boolean;
    onSelect?: (id: number) => void;
    onView: (product: ProductResponse) => void;
    onEdit: (product: ProductResponse) => void;
    onDuplicate: (product: ProductResponse) => void;
    onDelete: (product: ProductResponse) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
                                                            product,
                                                            selected = false,
                                                            onSelect,
                                                            onView,
                                                            onEdit,
                                                            onDuplicate,
                                                            onDelete
                                                        }) => {
    const [showActions, setShowActions] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getAvailabilityBadge = () => {
        if (!product.isActive) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inativo</span>;
        }

        if (!product.inventory) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Sem estoque</span>;
        }

        const { quantity, minStock } = product.inventory;
        if (quantity === 0) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Esgotado</span>;
        } else if (quantity <= minStock) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Baixo</span>;
        } else {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Disponível</span>;
        }
    };

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 relative group"
            style={{ width: '200px', height: '280px' }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Checkbox para seleção múltipla no canto superior esquerdo */}
            {onSelect && (
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelect(product.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                </div>
            )}

            {/* Badge de status no canto superior direito */}
            <div className="absolute top-3 right-3 z-10">
                {getAvailabilityBadge()}
            </div>

            {/* Imagem do produto ocupando 60% superior com lazy loading */}
            <div className="relative h-40 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                )}
                {/* Placeholder para lazy loading */}
                <div
                    className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center"
                    onLoad={() => setImageLoaded(true)}
                >
                    <Package className="w-12 h-12 text-purple-400" />
                </div>
            </div>

            {/* Informações do produto */}
            <div className="space-y-2">
                {/* Nome do produto truncado em 2 linhas */}
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {/* Código em texto menor cinza */}
                <p className="text-xs text-gray-500">{product.code}</p>

                {/* Preço em destaque com formatação monetária */}
                <p className="text-lg font-bold text-gray-900">
                    R$ {new Intl.NumberFormat('pt-BR').format(product.price)}
                </p>

                {/* Categoria */}
                <p className="text-xs text-gray-500">{product.category.name}</p>
            </div>

            {/* Quick actions no hover (view, edit, duplicate) */}
            {showActions && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onView(product)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                            title="Visualizar"
                        >
                            <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => onEdit(product)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => onDuplicate(product)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                            title="Duplicar"
                        >
                            <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};