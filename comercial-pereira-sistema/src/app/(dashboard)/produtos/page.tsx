// app/(dashboard)/produtos/page.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';


import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/product';
import {
    useBulkImport,
    useCreateProduct,
    useDeleteProduct,
    useProducts,
    useUpdateProduct
} from "@/lib/hooks/useProducts";
import {ProductForm} from "@/components/products/ProductForm";
import {ProductHeader} from "@/components/products/ProductsHeader";
import {CategoryTabs} from "@/components/products/CategoryTabs";
import {ProductCard} from "@/components/products/ProductCard";
import {ProductTable} from "@/components/products/ProductTable";
import {ProductBulkActions} from "@/components/products/ProductBulkActions";

// Mock data para categorias
const mockCategories = [
    { id: 1, name: 'Cosméticos', cnae: '4771-7/01', count: 45 },
    { id: 2, name: 'Ferragens', cnae: '4744-0/99', count: 32 },
    { id: 3, name: 'Papelaria', cnae: '4761-0/01', count: 28 },
    { id: 4, name: 'Material Elétrico', cnae: '4731-8/00', count: 18 },
    { id: 5, name: 'Embalagens', cnae: '4789-0/99', count: 25 },
    { id: 6, name: 'Cama/Mesa/Banho', cnae: '4754-7/01', count: 15 },
    { id: 7, name: 'Armarinho', cnae: '4789-0/02', count: 12 },
    { id: 8, name: 'Equipamentos', cnae: '4663-0/00', count: 8 }
];

const mockSuppliers = [
    { value: 1, label: 'Fornecedor A Ltda' },
    { value: 2, label: 'Distribuidora B S/A' },
    { value: 3, label: 'Comercial C & Cia' }
];

export default function ProdutosPage() {
    // Estados locais
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    // Hooks customizados
    const {
        products,
        pagination,
        filters,
        summary,
        updateFilters,
        changePage,
        changeSort,
        isLoading
    } = useProducts({
        categoryId: activeCategory || undefined
    });

    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const bulkImportMutation = useBulkImport();

    // Handlers para seleção
    const handleSelectProduct = (id: number) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (selectAll: boolean) => {
        setSelectedProducts(selectAll ? products.map(p => p.id) : []);
    };

    const handleClearSelection = () => {
        setSelectedProducts([]);
    };

    // Handlers para CRUD
    const handleCreateProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product: ProductResponse) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleViewProduct = (product: ProductResponse) => {
        toast.info(`Visualizando produto: ${product.name}`);
        // Aqui você pode implementar um modal de visualização ou navegar para uma página de detalhes
    };

    const handleDuplicateProduct = (product: ProductResponse) => {
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
    };

    const handleDeleteProduct = (product: ProductResponse) => {
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
    };

    // Handler para formulário
    const handleFormSubmit = (data: CreateProductRequest | UpdateProductRequest) => {
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
    };

    // Handlers para ações em lote
    const handleBulkAction = (action: string) => {
        switch (action) {
            case 'export':
                toast.info(`Exportando ${selectedProducts.length} produtos...`);
                break;
            case 'changeCategory':
                toast.info(`Alterando categoria de ${selectedProducts.length} produtos...`);
                break;
            case 'updatePrice':
                toast.info(`Atualizando preço de ${selectedProducts.length} produtos...`);
                break;
            case 'delete':
                if (window.confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produtos selecionados?`)) {
                    toast.info(`Excluindo ${selectedProducts.length} produtos...`);
                    handleClearSelection();
                }
                break;
        }
    };

    const handleImport = () => {
        toast.info('Funcionalidade de importação em desenvolvimento...');
    };

    const handleExport = () => {
        toast.info('Exportando todos os produtos...');
    };

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
                    categories={mockCategories.map(c => ({ value: c.id, label: c.name }))}
                    suppliers={mockSuppliers}
                />
            </div>
        );
    }

    // Página principal do módulo de produtos
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header com filtros e ações */}
            <ProductHeader
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
            <CategoryTabs
                categories={mockCategories}
                activeCategory={activeCategory}
                onCategoryChange={(categoryId) => {
                    setActiveCategory(categoryId);
                    updateFilters({ categoryId: categoryId || undefined });
                }}
                loading={isLoading}
            />

            {/* Conteúdo principal */}
            <div className="p-6">
                {viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map(product => (
                            <ProductCard
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
                    <ProductTable
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
            <ProductBulkActions
                selectedCount={selectedProducts.length}
                onClearSelection={handleClearSelection}
                onBulkDelete={() => handleBulkAction('delete')}
                onBulkExport={() => handleBulkAction('export')}
                onBulkChangeCategory={() => handleBulkAction('changeCategory')}
                onBulkUpdatePrice={() => handleBulkAction('updatePrice')}
                loading={deleteProductMutation.isPending}
            />
        </div>
    );
}