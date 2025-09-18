// app/categories/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    CategoryResponse,
    UpdateCategoryRequest,
    CATEGORY_CNAE_MAPPING,
    ValidCNAE
} from '@/types/category'

import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    BarChart3,
    Settings,
    AlertCircle,
    CheckCircle,
    X,
    Loader2,
    Eye,
    Users,
    TrendingUp,
    Calendar
} from 'lucide-react'
import {CategoryAnalytics} from "@/components/category/CategoryAnalytics";

interface CategoryDetailsProps {
    category: CategoryResponse
    onEdit: () => void
    onDelete: () => void
}

const CategoryHeader: React.FC<CategoryDetailsProps> = ({ category, onEdit, onDelete }) => {
    const getCategoryDisplayName = () => {
        if (category.cnae && CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]) {
            return CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]
        }
        return category.name
    }

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getCategoryDisplayName()}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                category.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                {category.isActive ? 'Ativa' : 'Inativa'}
              </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            {category.cnae && (
                                <div className="flex items-center gap-1">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>CNAE: {category.cnae}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>{category._count?.products || 0} produtos</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Criada em {new Date(category.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>

                        {category.description && (
                            <p className="mt-3 text-gray-700 max-w-2xl">
                                {category.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>

                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface TabNavigationProps {
    activeTab: string
    onTabChange: (tab: string) => void
    productCount: number
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, productCount }) => {
    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: Eye },
        { id: 'products', label: `Produtos (${productCount})`, icon: Package },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Configurações', icon: Settings }
    ]

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <IconComponent className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}

export default function CategoryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = parseInt(params.id as string)

    const [category, setCategory] = useState<CategoryResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('overview')

    const [notification, setNotification] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const fetchCategory = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/categories/${categoryId}`)

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Categoria não encontrada')
                    return
                }
                throw new Error('Erro ao buscar categoria')
            }

            const categoryData = await response.json()
            setCategory(categoryData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao atualizar categoria')
            }

            const updatedCategory = await response.json()
            setCategory(updatedCategory)
            showNotification('success', 'Categoria atualizada com sucesso!')
        } catch (error) {
            showNotification('error', error instanceof Error ? error.message : 'Erro ao atualizar categoria')
        }
    }

    const handleDeleteCategory = async () => {
        const confirmDelete = window.confirm(
            `Tem certeza que deseja deletar a categoria "${category?.name}"? Esta ação não pode ser desfeita.`
        )

        if (!confirmDelete || !category) return

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao deletar categoria')
            }

            showNotification('success', 'Categoria deletada com sucesso!')

            // Redirecionar para lista após 2 segundos
            setTimeout(() => {
                router.push('/categories')
            }, 2000)
        } catch (error) {
            showNotification('error', error instanceof Error ? error.message : 'Erro ao deletar categoria')
        }
    }

    const handleEditCategory = () => {
        setActiveTab('settings')
    }

    const handleViewProducts = () => {
        router.push(`/categories/${categoryId}/products`)
    }

    useEffect(() => {
        if (categoryId && !isNaN(categoryId)) {
            fetchCategory()
        } else {
            setError('ID da categoria inválido')
            setLoading(false)
        }
    }, [categoryId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Carregando categoria...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => router.push('/categories')}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para categorias
                            </button>
                            <button
                                onClick={fetchCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!category) return null

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.push('/categories')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para categorias
                    </button>
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

            {/* Header */}
            <CategoryHeader
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
            />

            {/* Tab navigation */}
            <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                productCount={category._count?.products || 0}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Quick stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <Package className="w-8 h-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                                        <p className="text-2xl font-bold text-gray-900">{category._count?.products || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                                        <p className="text-2xl font-bold text-gray-900">--</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Vendas no Mês</p>
                                        <p className="text-2xl font-bold text-gray-900">--</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleViewProducts}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Package className="w-4 h-4" />
                                    Ver Produtos
                                </button>

                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Ver Analytics
                                </button>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configurações
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Lista de Produtos
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Esta seção mostrará todos os produtos desta categoria
                            </p>
                            <button
                                onClick={handleViewProducts}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Ver página completa de produtos
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <CategoryAnalytics
                        category={category}
                        onExportReport={() => showNotification('success', 'Relatório exportado!')}
                    />
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Configurações da Categoria
                        </h3>
                        <p className="text-gray-600">
                            Funcionalidade de edição será implementada aqui, similar ao CategoryDetailPanel.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}