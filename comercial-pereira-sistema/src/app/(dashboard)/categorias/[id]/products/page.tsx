// app/categories/[id]/products/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Search,
    Eye,
    Edit,
    Package,
    Grid3X3,
    List,
    Download,
    Plus,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    X,
    Loader2,
} from 'lucide-react'
import {useCategoryProducts} from "@/lib/hooks/useCategoryProducts";
import { ProductResponse } from '@/types/product'

interface ProductCardProps {
    product: ProductResponse  // Use ProductResponse
    onView: (product: ProductResponse) => void
    onEdit: (product: ProductResponse) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onEdit }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate mb-1">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                    Código: {product.code}
                </p>
            </div>

            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
        {product.isActive ? 'Ativo' : 'Inativo'}
      </span>
        </div>

        <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-gray-900">
                R$ {Number(product.price).toFixed(2)}
            </div>

            {product.inventory !== undefined && (
                <div className="text-sm text-gray-600">
                    Estoque: {product.inventory?.quantity || 0}
                </div>
            )}
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={() => onView(product)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
                <Eye className="w-3 h-3" />
                Ver
            </button>

            <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            >
                <Edit className="w-3 h-3" />
                Editar
            </button>
        </div>
    </div>
)

interface ProductTableRowProps {
    product: ProductResponse  // Use ProductResponse
    onView: (product: ProductResponse) => void
    onEdit: (product: ProductResponse) => void
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({ product, onView, onEdit }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
            <div>
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">Código: {product.code}</div>
            </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
                R$ {Number(product.price).toFixed(2)}
            </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          product.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
      }`}>
        {product.isActive ? 'Ativo' : 'Inativo'}
      </span>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {product.inventory?.quantity || '--'}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center gap-2 justify-end">
                <button
                    onClick={() => onView(product)}
                    className="text-blue-600 hover:text-blue-900"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onEdit(product)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
)

export default function CategoryProductsPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = parseInt(params.id as string)

    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [filters, setFilters] = useState({
        search: '',
        isActive: undefined as boolean | undefined,
        minPrice: '',
        maxPrice: '',
        sortBy: 'name' as 'name' | 'price' | 'code',
        sortOrder: 'asc' as 'asc' | 'desc'
    })

    const [category, setCategory] = useState<{ id: number; name: string } | null>(null)
    const [notification, setNotification] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const {
        products,
        loading,
        error,
        total,
        currentPage,
        totalPages,
        setPage,
        setSearch,
        refresh
    } = useCategoryProducts(categoryId, 12)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const fetchCategoryInfo = async () => {
        try {
            const response = await fetch(`/api/categories/${categoryId}`)
            if (response.ok) {
                const categoryData = await response.json()
                setCategory({ id: categoryData.id, name: categoryData.name })
            }
        } catch (err) {
            console.error('Erro ao buscar categoria:', err)
        }
    }

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }))
        setSearch(value)
    }

    const handleViewProduct = (product: ProductResponse) => {
        router.push(`/products/${product.id}`)
    }

    const handleEditProduct = (product: ProductResponse) => {
        router.push(`/products/${product.id}/edit`)
    }

    const handleCreateProduct = () => {
        router.push(`/products/new?categoryId=${categoryId}`)
    }

    const exportProductsCSV = () => {
        const headers = ['ID', 'Nome', 'Código', 'Preço', 'Status', 'Estoque']

        const csvContent = [
            headers.join(','),
            ...products.map((product) => [
                product.id,
                `"${product.name}"`,
                product.code,
                product.price,
                product.isActive ? 'Ativo' : 'Inativo',
                product.inventory?.quantity || 0
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `produtos_categoria_${categoryId}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showNotification('success', 'Produtos exportados para CSV!')
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            isActive: undefined,
            minPrice: '',
            maxPrice: '',
            sortBy: 'name',
            sortOrder: 'asc'
        })
        setSearch('')
    }

    const hasActiveFilters = filters.search ||
        filters.isActive !== undefined ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.sortBy !== 'name' ||
        filters.sortOrder !== 'asc'

    useEffect(() => {
        if (categoryId && !isNaN(categoryId)) {
            fetchCategoryInfo()
        }
    }, [categoryId])

    if (loading && !products.length) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Carregando produtos...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="py-4">
                        <nav className="flex items-center gap-2 text-sm text-gray-600">
                            <button
                                onClick={() => router.push('/categories')}
                                className="hover:text-gray-900"
                            >
                                Categorias
                            </button>
                            <span>/</span>
                            <button
                                onClick={() => router.push(`/categories/${categoryId}`)}
                                className="hover:text-gray-900"
                            >
                                {category?.name || 'Categoria'}
                            </button>
                            <span>/</span>
                            <span className="text-gray-900">Produtos</span>
                        </nav>
                    </div>

                    {/* Title and actions */}
                    <div className="flex items-center justify-between pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Produtos da Categoria: {category?.name}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {total} produtos encontrados
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View mode toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                    Tabela
                                </button>
                            </div>

                            <button
                                onClick={handleCreateProduct}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Novo Produto
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 ${
                    notification.type === 'success' ? 'border-green-200' : 'border-red-200'
                }`}>
                    <div className="flex items-start gap-3">
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">Status</option>
                            <option value="true">Ativos</option>
                            <option value="false">Inativos</option>
                        </select>

                        {/* Price filters */}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Preço mín"
                                value={filters.minPrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Preço máx"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-') as [any, any]
                                setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="price-asc">Menor preço</option>
                            <option value="price-desc">Maior preço</option>
                            <option value="code-asc">Código (A-Z)</option>
                            <option value="code-desc">Código (Z-A)</option>
                        </select>

                        {/* Export and clear */}
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <X className="w-4 h-4" />
                                    Limpar
                                </button>
                            )}

                            <button
                                onClick={exportProductsCSV}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" />
                                CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar produtos</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filters.search || hasActiveFilters ? 'Nenhum produto encontrado' : 'Nenhum produto nesta categoria'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filters.search || hasActiveFilters
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece criando o primeiro produto desta categoria'
                            }
                        </p>
                        <button
                            onClick={handleCreateProduct}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Criar Produto
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Products display */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onView={handleViewProduct}
                                        onEdit={handleEditProduct}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estoque
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <ProductTableRow
                                            key={product.id}
                                            product={product}
                                            onView={handleViewProduct}
                                            onEdit={handleEditProduct}
                                        />
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {((currentPage - 1) * 12) + 1} até {Math.min(currentPage * 12, total)} de {total} produtos
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = i + 1
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setPage(page)}
                                                    className={`px-3 py-1 text-sm rounded ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}

                                        {totalPages > 5 && (
                                            <>
                                                <span className="px-2 text-gray-500">...</span>
                                                <button
                                                    onClick={() => setPage(totalPages)}
                                                    className={`px-3 py-1 text-sm rounded ${
                                                        currentPage === totalPages
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}