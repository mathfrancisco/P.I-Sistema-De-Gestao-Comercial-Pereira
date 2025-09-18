import React from 'react'
import { CategoryFilters } from '@/types/category'
import { Filter, X, Download } from 'lucide-react'

interface CategoryFiltersProps {
    filters: CategoryFilters
    searchTerm: string
    onFiltersChange: (filters: CategoryFilters) => void
    onSearchChange: (search: string) => void
    onClearFilters: () => void
    onExportCSV?: () => void
    categoriesCount?: number
}

export const CategoryAdvancedFilters: React.FC<CategoryFiltersProps> = ({
                                                                            filters,
                                                                            searchTerm,
                                                                            onFiltersChange,
                                                                            onSearchChange,
                                                                            onClearFilters,
                                                                            onExportCSV,
                                                                            categoriesCount = 0
                                                                        }) => {
    const hasActiveFilters = searchTerm ||
        filters.isActive !== undefined ||
        filters.hasCnae !== undefined ||
        filters.sortBy !== 'name' ||
        filters.sortOrder !== 'asc'

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-3">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-64">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou descrição..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="">Status</option>
                        <option value="true">Ativas</option>
                        <option value="false">Inativas</option>
                    </select>

                    {/* CNAE Filter */}
                    <select
                        value={filters.hasCnae === undefined ? '' : filters.hasCnae.toString()}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            hasCnae: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="">CNAE</option>
                        <option value="true">Com CNAE</option>
                        <option value="false">Sem CNAE</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={`${filters.sortBy || 'name'}-${filters.sortOrder || 'asc'}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-') as [any, any]
                            onFiltersChange({ ...filters, sortBy, sortOrder })
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="name-asc">Nome (A-Z)</option>
                        <option value="name-desc">Nome (Z-A)</option>
                        <option value="createdAt-desc">Mais recentes</option>
                        <option value="createdAt-asc">Mais antigas</option>
                        <option value="productCount-desc">Mais produtos</option>
                        <option value="productCount-asc">Menos produtos</option>
                    </select>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <X className="w-4 h-4" />
                            Limpar
                        </button>
                    )}

                    {/* Export */}
                    {onExportCSV && (
                        <button
                            onClick={onExportCSV}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </button>
                    )}
                </div>

                {/* Results summary */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            {categoriesCount} categoria{categoriesCount !== 1 ? 's' : ''} encontrada{categoriesCount !== 1 ? 's' : ''}
          </span>

                    {hasActiveFilters && (
                        <span>
              • Filtros aplicados
            </span>
                    )}
                </div>
            </div>
        </div>
    )
}