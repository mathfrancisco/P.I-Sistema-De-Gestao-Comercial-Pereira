// app/(dashboard)/produtos/[id]/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ArrowLeft, Edit, Copy, Trash2, Package, Tag, DollarSign,
    MapPin, Calendar, User, Building2, BarChart3, TrendingUp,
    Eye, AlertTriangle
} from 'lucide-react';

import { useProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { useCategories } from '@/lib/hooks/useCategories';
import { useActiveSuppliers } from '@/lib/hooks/useSuppliers';
import type { ProductResponse, UpdateProductRequest } from '@/types/product';

interface ProductDetailPageProps {
    params: {
        id: string;
    };
}

// Componente de estatísticas
const ProductStatsCard = ({ title, value, icon: Icon, trend, trendValue }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
}) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && trendValue && (
                    <div className={`flex items-center mt-2 text-sm ${
                        trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-600" />
            </div>
        </div>
    </div>
);

// Componente de badge de status
const StatusBadge = ({ product }: { product: ProductResponse }) => {
    if (!product.isActive) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Inativo
            </span>
        );
    }

    if (!product.inventory) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                Sem controle de estoque
            </span>
        );
    }

    const { quantity, minStock } = product.inventory;
    if (quantity === 0) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Esgotado
            </span>
        );
    } else if (quantity <= minStock) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Estoque baixo
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            Disponível
        </span>
    );
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const router = useRouter();
    const productId = parseInt(params.id);
    const [showEditForm, setShowEditForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'history'>('overview');

    // Hooks
    const { data: productData, isLoading, error, refetch } = useProduct(productId, true);
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    // Dados para o formulário
    const { categories: categoriesData } = useCategories('', { includeProductCount: false });
    const { suppliers: suppliersData } = useActiveSuppliers();

    const product = productData?.data;

    // Transformar dados para o formulário
    const transformedCategories = useMemo(() => {
        if (!Array.isArray(categoriesData)) return [];
        return categoriesData.map(category => ({
            value: category.id,
            label: category.name
        }));
    }, [categoriesData]);

    const transformedSuppliers = useMemo(() => {
        if (!Array.isArray(suppliersData)) return [];
        return suppliersData.map(supplier => ({
            value: supplier.id,
            label: supplier.name
        }));
    }, [suppliersData]);

    // Handlers
    const handleEdit = () => {
        setShowEditForm(true);
    };

    const handleFormSubmit = (data: UpdateProductRequest) => {
        updateProductMutation.mutate(
            { id: productId, data },
            {
                onSuccess: () => {
                    toast.success('Produto atualizado com sucesso!');
                    setShowEditForm(false);
                    refetch();
                },
                onError: (error) => {
                    toast.error(`Erro ao atualizar produto: ${error.message}`);
                }
            }
        );
    };

    const handleDelete = () => {
        if (window.confirm(`Tem certeza que deseja excluir o produto "${product?.name}"?`)) {
            deleteProductMutation.mutate(
                { id: productId, reason: 'Exclusão via página de detalhes' },
                {
                    onSuccess: () => {
                        toast.success('Produto excluído com sucesso!');
                        router.push('/produtos');
                    },
                    onError: (error) => {
                        toast.error(`Erro ao excluir produto: ${error.message}`);
                    }
                }
            );
        }
    };

    const handleDuplicate = () => {
        if (product) {
            // Navegar para página de criação com dados pré-preenchidos
            const queryParams = new URLSearchParams({
                duplicate: productId.toString()
            });
            router.push(`/produtos/novo?${queryParams}`);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
                                <div className="h-48 bg-gray-200 rounded-xl"></div>
                            </div>
                            <div>
                                <div className="h-80 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Produto não encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        O produto solicitado não existe ou você não tem permissão para visualizá-lo.
                    </p>
                    <button
                        onClick={() => router.push('/produtos')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Voltar para produtos
                    </button>
                </div>
            </div>
        );
    }

    // Se está editando, mostrar formulário
    if (showEditForm) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <ProductForm
                    product={product}
                    mode="edit"
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowEditForm(false)}
                    loading={updateProductMutation.isPending}
                    categories={transformedCategories}
                    suppliers={transformedSuppliers}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/produtos')}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p className="text-sm text-gray-500">Código: {product.code}</p>
                            </div>
                            <StatusBadge product={product} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleDuplicate}
                                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                            </button>
                            <button
                                onClick={handleEdit}
                                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                disabled={deleteProductMutation.isPending}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Image and Basic Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Informações Básicas</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600">Nome:</span>
                                                <span className="ml-2 font-medium">{product.name}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Tag className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600">Código:</span>
                                                <span className="ml-2 font-medium">{product.code}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600">Preço:</span>
                                                <span className="ml-2 font-medium">
                                                    R$ {new Intl.NumberFormat('pt-BR').format(product.price)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-600">Categoria:</span>
                                                <span className="ml-2 font-medium">{product.category.name}</span>
                                            </div>
                                            {product.supplier && (
                                                <div className="flex items-center text-sm">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-600">Fornecedor:</span>
                                                    <span className="ml-2 font-medium">{product.supplier.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-6">
                                    {[
                                        { id: 'overview', name: 'Visão Geral', icon: Eye },
                                        { id: 'stats', name: 'Estatísticas', icon: BarChart3 },
                                        { id: 'history', name: 'Histórico', icon: Calendar },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center py-4 text-sm font-medium border-b-2 transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <tab.icon className="w-4 h-4 mr-2" />
                                            {tab.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Detalhes do Produto</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Data de Criação
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Última Atualização
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {new Date(product.updatedAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            {product.barcode && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Código de Barras
                                                    </label>
                                                    <p className="text-sm text-gray-900">{product.barcode}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'stats' && (
                                    <div className="text-center py-8 text-gray-500">
                                        Estatísticas de vendas em desenvolvimento...
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="text-center py-8 text-gray-500">
                                        Histórico de alterações em desenvolvimento...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        {product.inventory && (
                            <>
                                <ProductStatsCard
                                    title="Estoque Atual"
                                    value={product.inventory.quantity}
                                    icon={Package}
                                />
                                <ProductStatsCard
                                    title="Estoque Mínimo"
                                    value={product.inventory.minStock}
                                    icon={AlertTriangle}
                                />
                                {product.inventory.location && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-600">Localização</p>
                                                <p className="font-medium">{product.inventory.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-4">Ações Rápidas</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleEdit}
                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Produto
                                </button>
                                <button
                                    onClick={handleDuplicate}
                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicar Produto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}