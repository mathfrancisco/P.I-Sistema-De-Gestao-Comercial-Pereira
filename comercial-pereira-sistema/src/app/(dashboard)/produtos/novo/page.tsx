// app/(dashboard)/produtos/novo/page.tsx
'use client';

import React, {  useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Package } from 'lucide-react';

import { useCreateProduct, useProduct } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { useActiveSuppliers } from '@/lib/hooks/useSuppliers';
import { ProductForm } from '@/components/products/ProductForm';
import type { CreateProductRequest } from '@/types/product';

export default function NewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Check if we're duplicating a product
    const duplicateId = searchParams.get('duplicate');
    const duplicateProductId = duplicateId ? parseInt(duplicateId) : null;

    // Hooks
    const createProductMutation = useCreateProduct();

    // Get product data if duplicating
    const {
        data: duplicateProductData,
        isLoading: isLoadingDuplicate
    } = useProduct(duplicateProductId, false);

    // Get categories and suppliers
    const {
        categories: categoriesData,
        loading: categoriesLoading
    } = useCategories('', { includeProductCount: false });

    const {
        suppliers: suppliersData,
        isLoading: suppliersLoading
    } = useActiveSuppliers();

    // Transform data for form
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

    // Create initial product data (for duplicating)
    const initialProduct = useMemo(() => {
        if (!duplicateProductData?.data) return null;

        const original = duplicateProductData.data;
        return {
            id: 0, // Fake ID for form
            name: `${original.name} (Cópia)`,
            description: original.description,
            price: original.price,
            code: '', // Will be auto-generated
            barcode: undefined,
            categoryId: original.categoryId,
            supplierId: original.supplierId,
            isActive: false, // Start inactive for review
            createdAt: new Date(),
            updatedAt: new Date(),
            category: original.category,
            supplier: original.supplier,
            inventory: {
                quantity: 0,
                minStock: original.inventory?.minStock || 10,
                maxStock: original.inventory?.maxStock || undefined,
                location: original.inventory?.location || undefined,
                isLowStock: false
            }
        };
    }, [duplicateProductData]);

    // Handle form submission
    const handleSubmit = async (data: CreateProductRequest) => {
        setIsLoading(true);

        try {
            await createProductMutation.mutateAsync(data);
            toast.success('Produto criado com sucesso!');
            router.push('/produtos');
        } catch (error: any) {
            toast.error(`Erro ao criar produto: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/produtos');
    };

    // Loading state
    const isLoadingData = categoriesLoading || suppliersLoading || (duplicateProductId && isLoadingDuplicate);

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dados do formulário...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center">
                        <button
                            onClick={handleCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors mr-4"
                            disabled={isLoading}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {duplicateProductId ? 'Duplicar Produto' : 'Novo Produto'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {duplicateProductId
                                        ? 'Criando uma cópia do produto existente'
                                        : 'Preencha as informações para criar um novo produto'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Tips Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Dicas para criar um produto</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use nomes descritivos e específicos para facilitar a busca</li>
                        <li>• O código será gerado automaticamente se não informado</li>
                        <li>• Defina estoque mínimo para receber alertas automáticos</li>
                        <li>• Produtos inativos não aparecem nas vendas</li>
                    </ul>
                </div>

                {/* Form */}
                <ProductForm
                    product={initialProduct}
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={isLoading || createProductMutation.isPending}
                    categories={transformedCategories}
                    suppliers={transformedSuppliers}
                />
            </div>
        </div>
    );
}