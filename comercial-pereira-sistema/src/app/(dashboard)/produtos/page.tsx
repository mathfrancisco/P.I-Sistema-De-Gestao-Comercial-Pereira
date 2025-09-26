// app/(dashboard)/produtos/page.tsx - VERSÃO FINAL CORRIGIDA PARA SUA API
'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/product';
import {
    useBulkImport,
    useCreateProduct,
    useDeleteProduct,
    useProducts,
    useUpdateProduct
} from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useActiveSuppliers } from "@/lib/hooks/useSuppliers";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductHeader } from "@/components/products/ProductsHeader";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductBulkActions } from "@/components/products/ProductBulkActions";

// Memoizar componentes para evitar re-renders desnecessários
const MemoizedProductCard = React.memo(ProductCard);
const MemoizedProductTable = React.memo(ProductTable);
const MemoizedCategoryTabs = React.memo(CategoryTabs);
const MemoizedProductHeader = React.memo(ProductHeader);

export default function ProdutosPage() {
    // Estados locais
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    // Usar refs para evitar mudanças em dependencies
    const selectedProductsRef = useRef(selectedProducts);
    selectedProductsRef.current = selectedProducts;

    // CORREÇÃO: Filtros iniciais memoizados e estáveis
    const initialFilters = useMemo(() => ({
        categoryId: activeCategory || undefined
    }), [activeCategory]);

    // Hooks para dados com configuração otimizada
    const {
        products,
        pagination,
        filters,
        summary,
        updateFilters,
        changePage,
        changeSort,
        isLoading,
        isError,
        error
    } = useProducts(initialFilters);

    // CORREÇÃO: Buscar categorias - remover includeProductCount (já é padrão no hook)
    const {
        categories: categoriesData,
        loading: categoriesLoading,
        error: categoriesError
    } = useCategories('', {}); // Hook já inclui includeProductCount por padrão

    // Buscar fornecedores ativos
    const {
        suppliers: suppliersData,
        isLoading: suppliersLoading,
        error: suppliersError
    } = useActiveSuppliers();

    // Hooks para mutations
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const bulkImportMutation = useBulkImport();

    // CORREÇÃO CRÍTICA: Transformar categorias usando campo real da API
    const transformedCategories = useMemo(() => {
        if (!Array.isArray(categoriesData)) return [];
        return categoriesData.map(category => ({
            id: category.id,
            name: category.name,
            cnae: category.cnae || '',
            // CORREÇÃO: Usar productCount em vez de _count?.products
            count: category.productCount || 0
        }));
    }, [categoriesData]);

    const transformedSuppliers = useMemo(() => {
        if (!Array.isArray(suppliersData)) return [];
        return suppliersData.map(supplier => ({
            value: supplier.id,
            label: supplier.name
        }));
    }, [suppliersData]);

    const transformedCategoriesForForm = useMemo(() => {
        return transformedCategories.map(category => ({
            value: category.id,
            label: category.name
        }));
    }, [transformedCategories]);

    // Handlers memoizados SEM dependências instáveis
    const handleSelectProduct = useCallback((id: number) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = useCallback((selectAll: boolean) => {
        if (selectAll) {
            setSelectedProducts(products.map((p: ProductResponse) => p.id));
        } else {
            setSelectedProducts([]);
        }
    }, [products]);

    const handleClearSelection = useCallback(() => {
        setSelectedProducts([]);
    }, []);

    const handleCreateProduct = useCallback(() => {
        setEditingProduct(null);
        setShowForm(true);
    }, []);

    const handleEditProduct = useCallback((product: ProductResponse) => {
        setEditingProduct(product);
        setShowForm(true);
    }, []);

    const handleViewProduct = useCallback((product: ProductResponse) => {
        toast.info(`Visualizando produto: ${product.name}`);
        // TODO: Implementar navegação para página de detalhes
        // router.push(`/produtos/${product.id}`);
    }, []);

    const handleDuplicateProduct = useCallback((product: ProductResponse) => {
        const duplicateData: CreateProductRequest = {
            name: `${product.name} (Cópia)`,
            description: product.description,
            price: product.price,
            code: '', // Será gerado automaticamente
            barcode: undefined,
            categoryId: product.categoryId,
            supplierId: product.supplierId || undefined,
            isActive: false, // Inicia inativo para revisão
            initialStock: 0,
            minStock: product.inventory?.minStock || 10,
            maxStock: product.inventory?.maxStock || undefined,
            location: product.inventory?.location || undefined
        };

        createProductMutation.mutate(duplicateData, {
            onSuccess: () => {
                toast.success('Produto duplicado com sucesso!');
            },
            onError: (error) => {
                toast.error(`Erro ao duplicar produto: ${error.message}`);
            }
        });
    }, [createProductMutation]);

    const handleDeleteProduct = useCallback((product: ProductResponse) => {
        if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
            deleteProductMutation.mutate(
                { id: product.id, reason: 'Exclusão via interface' },
                {
                    onSuccess: () => {
                        toast.success('Produto excluído com sucesso!');
                    },
                    onError: (error) => {
                        toast.error(`Erro ao excluir produto: ${error.message}`);
                    }
                }
            );
        }
    }, [deleteProductMutation]);

    const handleFormSubmit = useCallback((data: CreateProductRequest | UpdateProductRequest) => {
        if (editingProduct) {
            updateProductMutation.mutate(
                { id: editingProduct.id, data },
                {
                    onSuccess: () => {
                        toast.success('Produto atualizado com sucesso!');
                        setShowForm(false);
                        setEditingProduct(null);
                    },
                    onError: (error) => {
                        toast.error(`Erro ao atualizar produto: ${error.message}`);
                    }
                }
            );
        } else {
            createProductMutation.mutate(data as CreateProductRequest, {
                onSuccess: () => {
                    toast.success('Produto criado com sucesso!');
                    setShowForm(false);
                },
                onError: (error) => {
                    toast.error(`Erro ao criar produto: ${error.message}`);
                }
            });
        }
    }, [editingProduct, updateProductMutation, createProductMutation]);

    // Usar ref para evitar dependência instável
    const handleBulkAction = useCallback((action: string) => {
        const selectedCount = selectedProductsRef.current.length;

        switch (action) {
            case 'export':
                toast.info(`Exportando ${selectedCount} produtos...`);
                break;
            case 'changeCategory':
                toast.info(`Alterando categoria de ${selectedCount} produtos...`);
                break;
            case 'updatePrice':
                toast.info(`Atualizando preço de ${selectedCount} produtos...`);
                break;
            case 'delete':
                if (window.confirm(`Tem certeza que deseja excluir ${selectedCount} produtos selecionados?`)) {
                    toast.info(`Excluindo ${selectedCount} produtos...`);
                    setSelectedProducts([]);
                }
                break;
        }
    }, []); // Array vazio - usar ref para valores atuais

    const handleImport = useCallback(() => {
        toast.info('Funcionalidade de importação em desenvolvimento...');
    }, []);

    const handleExport = useCallback(() => {
        toast.info('Exportando todos os produtos...');
    }, []);

    // Handler para mudança de categoria otimizado
    const handleCategoryChange = useCallback((categoryId: number | null) => {
        setActiveCategory(categoryId);
        updateFilters({ categoryId: categoryId || undefined });
    }, [updateFilters]);

    // Estados de carregamento memoizados
    const isLoadingEssentialData = useMemo(() => {
        return isLoading || categoriesLoading || suppliersLoading;
    }, [isLoading, categoriesLoading, suppliersLoading]);

    const hasErrors = useMemo(() => {
        return isError || !!categoriesError || !!suppliersError;
    }, [isError, categoriesError, suppliersError]);

    // Debug: Log para identificar mudanças (remover em produção)
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🛍️ Products Page - Products count:', products.length, 'Loading:', isLoading);
        }
    }, [products.length, isLoading]);

    // Se está no modo de formulário, mostra apenas o formulário
    if (showForm) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <ProductForm
                    product={editingProduct}
                    mode={editingProduct ? 'edit' : 'create'}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                    loading={createProductMutation.isPending || updateProductMutation.isPending}
                    categories={transformedCategoriesForForm}
                    suppliers={transformedSuppliers}
                />
            </div>
        );
    }

    // Tratamento de erros
    if (hasErrors) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
                    <p className="text-gray-500 mb-4">
                        {error?.message ||
                            (typeof categoriesError === 'string' ? categoriesError : 'Erro nas categorias') ||
                            (typeof suppliersError === 'string' ? suppliersError : 'Erro nos fornecedores') ||
                            'Ocorreu um erro inesperado'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    // Página principal do módulo de produtos
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Debug info - REMOVER EM PRODUÇÃO */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 p-2 text-xs text-yellow-800">
                    Debug: {products.length} produtos | Loading: {isLoading ? 'Sim' : 'Não'} | Selected: {selectedProducts.length} | Category: {activeCategory || 'Todas'}
                </div>
            )}

            {/* Header com filtros e ações */}
            <MemoizedProductHeader
                onCreateProduct={handleCreateProduct}
                onImport={handleImport}
                onExport={handleExport}
                filters={filters}
                onFiltersChange={updateFilters}
                summary={summary}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCount={selectedProducts.length}
                onBulkAction={handleBulkAction}
            />

            {/* Tabs de categorias */}
            <MemoizedCategoryTabs
                categories={transformedCategories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                loading={categoriesLoading}
            />

            {/* Conteúdo principal */}
            <div className="p-6">
                {isLoadingEssentialData ? (
                    // Loading state
                    <div className="flex items-center justify-center min-h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando produtos...</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeCategory ? 'Nenhum produto nesta categoria' : 'Nenhum produto cadastrado'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeCategory
                                ? 'Não há produtos cadastrados nesta categoria. Experimente alterar os filtros ou criar um novo produto.'
                                : 'Comece criando seu primeiro produto para gerenciar seu estoque.'
                            }
                        </p>
                        <button
                            onClick={handleCreateProduct}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {activeCategory ? 'Criar Produto' : 'Criar Primeiro Produto'}
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((product: ProductResponse) => (
                            <MemoizedProductCard
                                key={product.id}
                                product={product}
                                selected={selectedProducts.includes(product.id)}
                                onSelect={handleSelectProduct}
                                onView={handleViewProduct}
                                onEdit={handleEditProduct}
                                onDuplicate={handleDuplicateProduct}
                                onDelete={handleDeleteProduct}
                            />
                        ))}
                    </div>
                ) : (
                    // List View
                    <MemoizedProductTable
                        products={products}
                        loading={isLoading}
                        selectedProducts={selectedProducts}
                        onSelectProduct={handleSelectProduct}
                        onSelectAll={handleSelectAll}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onViewProduct={handleViewProduct}
                        onDuplicateProduct={handleDuplicateProduct}
                        pagination={pagination ? {
                            currentPage: pagination.page,
                            totalPages: pagination.pages,
                            totalItems: pagination.total,
                            itemsPerPage: pagination.limit,
                            onPageChange: changePage,
                            onItemsPerPageChange: (limit) => updateFilters({ limit })
                        } : undefined}
                        onSort={changeSort}
                        sortColumn={filters.sortBy}
                        sortDirection={filters.sortOrder}
                    />
                )}
            </div>

            {/* Ações em lote */}
            {selectedProducts.length > 0 && (
                <ProductBulkActions
                    selectedCount={selectedProducts.length}
                    onClearSelection={handleClearSelection}
                    onBulkDelete={() => handleBulkAction('delete')}
                    onBulkExport={() => handleBulkAction('export')}
                    onBulkChangeCategory={() => handleBulkAction('changeCategory')}
                    onBulkUpdatePrice={() => handleBulkAction('updatePrice')}
                    loading={deleteProductMutation.isPending}
                />
            )}
        </div>
    );
}