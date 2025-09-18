// components/categories/CategoryGrid.tsx
'use client'

import React, { useState } from 'react'
import {
    CategoryResponse,
    CATEGORY_CNAE_MAPPING,
    ValidCNAE
} from '@/types/category'
import {
    Package,
    ShoppingBag,
    Palette,
    Bed,
    FileText,
    Wrench,
    Zap,
    Scissors,
    TrendingUp,
    Eye,
    Edit
} from 'lucide-react'

interface CategoryGridProps {
    categories: CategoryResponse[]
    loading: boolean
    onCategorySelect: (category: CategoryResponse) => void
    onCategoryEdit: (category: CategoryResponse) => void
    onCategoryView?: (category: CategoryResponse) => void
    onToggleStatus: (category: CategoryResponse) => void
}

interface CategoryCardProps {
    category: CategoryResponse
    onSelect: () => void
    onEdit: () => void
    onView?: () => void
    onToggleStatus: () => void
}

// Mapeamento de ícones por CNAE
const getCategoryIcon = (cnae: string | null) => {
    const iconMap: Record<string, any> = {
        "46.49-4-99": Package,      // Equipamentos Domésticos
        "46.86-9-02": Package,      // Embalagens
        "47.72-5-00": Palette,      // Cosméticos e Higiene
        "46.41-9-02": Bed,          // Cama, Mesa e Banho
        "46.47-8-01": FileText,     // Papelaria
        "46.72-9-00": Wrench,       // Ferragens
        "46.73-7-00": Zap,          // Material Elétrico
        "46.41-9-03": Scissors      // Armarinho
    }

    const IconComponent = cnae ? iconMap[cnae] : ShoppingBag
    return IconComponent || ShoppingBag
}

const CategoryCard: React.FC<CategoryCardProps> = ({
                                                       category,
                                                       onSelect,
                                                       onEdit,
                                                       onView,
                                                       onToggleStatus
                                                   }) => {
    const [isToggling, setIsToggling] = useState(false)
    const IconComponent = getCategoryIcon(category.cnae ?? null)

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsToggling(true)

        try {
            await onToggleStatus()
        } finally {
            setIsToggling(false)
        }
    }

    const getCategoryName = () => {
        if (category.cnae && CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]) {
            return CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]
        }
        return category.name
    }

    // Simular dados de vendas do mês (em um app real viria da API)
    const monthlySales = Math.floor(Math.random() * 100) + 20
    const salesTrend = Math.random() > 0.5 ? 'up' : 'down'
    const salesChange = Math.floor(Math.random() * 30) + 5

    return (
        <div
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            style={{ height: '180px' }}
            onClick={onSelect}
        >
            {/* Header com ícone e toggle */}
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex items-center gap-2">
                    {/* Toggle status */}
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`
              relative inline-flex h-5 w-9 items-center rounded-full transition-colors
              ${category.isActive ? 'bg-green-500' : 'bg-gray-300'}
              ${isToggling ? 'opacity-50' : ''}
            `}
                    >
            <span
                className={`
                inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                ${category.isActive ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
                    </button>

                    {/* Menu actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        {onView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onView()
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                title="Visualizar"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit()
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                    {getCategoryName()}
                </h3>

                {category.cnae && (
                    <p className="text-xs text-gray-500 mb-2">
                        CNAE: {category.cnae}
                    </p>
                )}

                {/* Contador de produtos */}
                <div className="flex items-center gap-1 mb-2">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
            {category._count?.products || 0} produtos
          </span>
                </div>

                {/* Mini gráfico de vendas */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Vendas do mês</span>
                        <div className={`flex items-center gap-1 ${
                            salesTrend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <TrendingUp className={`w-3 h-3 ${
                                salesTrend === 'down' ? 'rotate-180' : ''
                            }`} />
                            <span>{salesChange}%</span>
                        </div>
                    </div>

                    {/* Barra de progresso simples */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${monthlySales}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
                                                              categories,
                                                              loading,
                                                              onCategorySelect,
                                                              onCategoryEdit,
                                                              onCategoryView,
                                                              onToggleStatus
                                                          }) => {

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-100 rounded-lg animate-pulse"
                        style={{ height: '180px' }}
                    />
                ))}
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma categoria encontrada
                </h3>
                <p className="text-gray-500">
                    Tente ajustar os filtros de busca ou comece criando sua primeira categoria
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    onSelect={() => onCategorySelect(category)}
                    onEdit={() => onCategoryEdit(category)}
                    onView={onCategoryView ? () => onCategoryView(category) : undefined}
                    onToggleStatus={() => onToggleStatus(category)}
                />
            ))}
        </div>
    )
}