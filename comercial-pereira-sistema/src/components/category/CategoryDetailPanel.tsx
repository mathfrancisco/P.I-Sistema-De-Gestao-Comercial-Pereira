// components/categories/CategoryDetailPanel.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
    CategoryResponse,
    UpdateCategoryRequest,
    VALID_CNAES,
    CATEGORY_CNAE_MAPPING,
} from '@/types/category'
import {
    X,
    Settings,
    Package,
    BarChart3,
    Save,
    AlertCircle,
    Loader2,
    Eye,
    Edit,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Trash2
} from 'lucide-react'

interface CategoryDetailPanelProps {
    category: CategoryResponse | null
    isOpen: boolean
    onClose: () => void
    onSave: (categoryId: number, data: UpdateCategoryRequest) => Promise<void>
    onDelete?: (categoryId: number) => Promise<void>
    onRefresh: () => void
}

type TabType = 'settings' | 'products' | 'analytics'

interface ProductListProps {
    categoryId: number
}

const ProductList: React.FC<ProductListProps> = ({ categoryId }) => {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 10

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                sortBy: 'name',
                sortOrder: 'asc'
            })

            const response = await fetch(`/api/categories/${categoryId}/products?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar produtos')
            }

            const data = await response.json()
            setProducts(data.products)
            setTotal(data.total || 0)
        } catch (err) {
            console.error('Erro ao buscar produtos:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (categoryId) {
            fetchProducts()
        }
    }, [categoryId, page, search])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Lista de produtos */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {search ? 'Nenhum produto encontrado' : 'Nenhum produto nesta categoria'}
                </div>
            ) : (
                <div className="space-y-2">
                    {products.map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">
                                    {product.name}
                                </h4>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                    <span>Código: {product.code}</span>
                                    <span>R$ {Number(product.price).toFixed(2)}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        product.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {total} produtos encontrados
          </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-gray-600">
              {page} de {totalPages}
            </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export const CategoryDetailPanel: React.FC<CategoryDetailPanelProps> = ({
                                                                            category,
                                                                            isOpen,
                                                                            onClose,
                                                                            onSave,
                                                                            onDelete,
                                                                            onRefresh
                                                                        }) => {
    const [activeTab, setActiveTab] = useState<TabType>('settings')
    const [formData, setFormData] = useState<UpdateCategoryRequest>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Reset form when category changes
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description,
                cnae: category.cnae,
                isActive: category.isActive
            })
            setHasChanges(false)
            setError(null)
        }
    }, [category])

    const handleInputChange = (field: keyof UpdateCategoryRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
        setError(null)
    }

    const handleSave = async () => {
        if (!category || !hasChanges) return

        try {
            setLoading(true)
            setError(null)

            await onSave(category.id, formData)
            setHasChanges(false)
            onRefresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        if (hasChanges) {
            const confirmDiscard = window.confirm('Descartar alterações não salvas?')
            if (!confirmDiscard) return
        }
        onClose()
    }

    if (!isOpen || !category) return null

    const tabs = [
        { id: 'settings', label: 'Configurações', icon: Settings },
        { id: 'products', label: 'Produtos', icon: Package },
        { id: 'analytics', label: 'Análise', icon: BarChart3 }
    ]

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleCancel}
            />

            {/* Panel */}
            <div className="relative ml-auto w-full max-w-2xl bg-white shadow-xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {category.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Ativa' : 'Inativa'}
                </span>
                                {category.cnae && (
                                    <span className="text-xs text-gray-500">
                    CNAE: {category.cnae}
                  </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <button
                                    onClick={async () => {
                                        const confirmDelete = window.confirm(`Tem certeza que deseja deletar a categoria "${category.name}"?`)
                                        if (confirmDelete) {
                                            try {
                                                await onDelete(category.id)
                                                onClose()
                                            } catch (err) {
                                                console.error('Erro ao deletar:', err)
                                            }
                                        }
                                    }}
                                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                    title="Deletar categoria"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={handleCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-6 mt-4">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'settings' && (
                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-800 text-sm font-medium">Erro ao salvar</p>
                                        <p className="text-red-700 text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome da Categoria
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Digite o nome da categoria"
                                    />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Descrição opcional da categoria"
                                    />
                                </div>

                                {/* CNAE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código CNAE
                                    </label>
                                    <select
                                        value={formData.cnae || ''}
                                        onChange={(e) => handleInputChange('cnae', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione um CNAE (opcional)</option>
                                        {VALID_CNAES.map((cnae) => (
                                            <option key={cnae} value={cnae}>
                                                {cnae} - {CATEGORY_CNAE_MAPPING[cnae]}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        O CNAE ajuda na classificação fiscal dos produtos
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive || false}
                                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                      Categoria ativa
                    </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 ml-7">
                                        Categorias inativas não aparecem na criação de produtos
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="p-6">
                            <ProductList categoryId={category.id} />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="p-6">
                            <div className="text-center py-12 text-gray-500">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Analytics em desenvolvimento
                                </h3>
                                <p>Os gráficos de performance da categoria serão exibidos aqui.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - só mostra nos settings */}
                {activeTab === 'settings' && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="text-xs text-gray-500">
                            {hasChanges && '• Alterações não salvas'}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}