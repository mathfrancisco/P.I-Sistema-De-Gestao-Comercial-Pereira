// app/categories/page.tsx
'use client'

import React, { useState } from 'react'
import {
    CategoryResponse,
    CategoryFilters,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from '@/types/category'

import {
    Plus,
    BarChart3,
    Grid3X3,
    X,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {useCategories} from "@/lib/hooks/useCategories";
import {exportCategoriesToCSV} from "@/lib/utils/categoryUtils";
import {CategoryAdvancedFilters} from "@/components/category/CategoryFilters";
import {CategoryGrid} from "@/components/category/CategoryGrid";
import {CategoryAnalytics} from "@/components/category/CategoryAnalytics";
import {CategoryDetailPanel} from "@/components/category/CategoryDetailPanel";

type ViewMode = 'grid' | 'analytics'

interface CreateCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (data: CreateCategoryRequest) => Promise<void>
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onCreate
                                                                 }) => {
    const [formData, setFormData] = useState<CreateCategoryRequest>({
        name: '',
        description: '',
        cnae: undefined,
        isActive: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name?.trim()) {
            setError('Nome da categoria é obrigatório')
            return
        }

        try {
            setLoading(true)
            setError(null)

            await onCreate({
                ...formData,
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
                cnae: formData.cnae || null
            })

            // Reset form
            setFormData({
                name: '',
                description: '',
                cnae: undefined,
                isActive: true
            })

            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar categoria')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (loading) return
        setFormData({
            name: '',
            description: '',
            cnae: undefined,
            isActive: true
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Nova Categoria
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Categoria *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Digite o nome da categoria"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrição opcional da categoria"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código CNAE
                        </label>
                        <select
                            value={formData.cnae || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                cnae: e.target.value || undefined
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecione um CNAE (opcional)</option>
                            <option value="46.49-4-99">46.49-4-99 - Equipamentos Domésticos</option>
                            <option value="46.86-9-02">46.86-9-02 - Embalagens</option>
                            <option value="47.72-5-00">47.72-5-00 - Cosméticos e Higiene</option>
                            <option value="46.41-9-02">46.41-9-02 - Cama, Mesa e Banho</option>
                            <option value="46.47-8-01">46.47-8-01 - Papelaria</option>
                            <option value="46.72-9-00">46.72-9-00 - Ferragens</option>
                            <option value="46.73-7-00">46.73-7-00 - Material Elétrico</option>
                            <option value="46.41-9-03">46.41-9-03 - Armarinho</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isActive: e.target.checked
                                }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                Categoria ativa
              </span>
                        </label>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !formData.name?.trim()}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Criando...' : 'Criar Categoria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function CategoriesPage() {
    const router = useRouter()

    // Estado dos filtros e busca
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<CategoryFilters>({
        sortBy: 'name',
        sortOrder: 'asc',
        includeProductCount: true
    })

    // Usar o hook customizado
    const {
        categories,
        loading,
        error,
        total,
        refresh,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus
    } = useCategories(searchTerm, filters)

    // Estado da interface
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null)
    const [showDetailPanel, setShowDetailPanel] = useState(false)

    // Estado de feedback
    const [notification, setNotification] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleCreateCategory = async (data: CreateCategoryRequest) => {
        try {
            await createCategory(data)
            showNotification('success', 'Categoria criada com sucesso!')
        } catch (error) {
            throw error // Re-throw para o modal tratar
        }
    }

    const handleUpdateCategory = async (categoryId: number, data: UpdateCategoryRequest) => {
        try {
            const updatedCategory = await updateCategory(categoryId, data)
            setSelectedCategory(updatedCategory)
            showNotification('success', 'Categoria atualizada com sucesso!')
        } catch (error) {
            throw error // Re-throw para o painel tratar
        }
    }

    const handleDeleteCategory = async (categoryId: number) => {
        try {
            await deleteCategory(categoryId)
            showNotification('success', 'Categoria deletada com sucesso!')
            if (selectedCategory?.id === categoryId) {
                setSelectedCategory(null)
                setShowDetailPanel(false)
            }
        } catch (error) {
            showNotification('error', error instanceof Error ? error.message : 'Erro ao deletar categoria')
        }
    }

    const handleCategorySelect = (category: CategoryResponse) => {
        setSelectedCategory(category)
        if (viewMode === 'grid') {
            setShowDetailPanel(true)
        }
    }

    const handleCategoryEdit = (category: CategoryResponse) => {
        setSelectedCategory(category)
        setShowDetailPanel(true)
    }

    const handleCategoryView = (category: CategoryResponse) => {
        router.push(`/categories/${category.id}`)
    }

    const handleToggleStatus = async (category: CategoryResponse) => {
        try {
            await toggleCategoryStatus(category.id)
            showNotification('success', `Categoria ${category.isActive ? 'desativada' : 'ativada'} com sucesso!`)
        } catch (error) {
            showNotification('error', error instanceof Error ? error.message : 'Erro ao alterar status')
        }
    }

    const handleExportReport = () => {
        if (!selectedCategory) return

        // Aqui implementaria a geração do PDF
        console.log('Exportando relatório para:', selectedCategory.name)
        showNotification('success', 'Relatório exportado com sucesso!')
    }

    const handleExportCSV = () => {
        exportCategoriesToCSV(categories)
        showNotification('success', 'Dados exportados para CSV!')
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({
            sortBy: 'name',
            sortOrder: 'asc',
            includeProductCount: true
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                            <p className="text-sm text-gray-600">
                                Gerencie as categorias de produtos da sua empresa
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
                                    onClick={() => setViewMode('analytics')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'analytics'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Analytics
                                </button>
                            </div>

                            {/* Action buttons */}
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                title="Atualizar"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Nova Categoria
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
            {viewMode === 'grid' && (
                <CategoryAdvancedFilters
                    filters={filters}
                    searchTerm={searchTerm}
                    onFiltersChange={setFilters}
                    onSearchChange={setSearchTerm}
                    onClearFilters={clearFilters}
                    onExportCSV={handleExportCSV}
                    categoriesCount={total}
                />
            )}

            {/* Error state */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h3 className="text-red-800 font-medium mb-1">Erro ao carregar categorias</h3>
                        <p className="text-red-700 text-sm mb-3">{error}</p>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Main content */}
            {!error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {viewMode === 'grid' ? (
                        <CategoryGrid
                            categories={categories}
                            loading={loading}
                            onCategorySelect={handleCategorySelect}
                            onCategoryEdit={handleCategoryEdit}
                            onCategoryView={handleCategoryView}
                            onToggleStatus={handleToggleStatus}
                        />
                    ) : selectedCategory ? (
                        <CategoryAnalytics
                            category={selectedCategory}
                            onExportReport={handleExportReport}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Selecione uma categoria
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Escolha uma categoria no modo grid para ver suas análises
                            </p>
                            <button
                                onClick={() => setViewMode('grid')}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Voltar ao grid
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals and panels */}
            <CreateCategoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCategory}
            />

            <CategoryDetailPanel
                category={selectedCategory}
                isOpen={showDetailPanel}
                onClose={() => setShowDetailPanel(false)}
                onSave={handleUpdateCategory}
                onDelete={handleDeleteCategory}
                onRefresh={refresh}
            />
        </div>
    )
}