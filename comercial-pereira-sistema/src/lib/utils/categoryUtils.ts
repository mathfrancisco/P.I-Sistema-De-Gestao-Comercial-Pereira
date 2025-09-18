import { CategoryResponse, CATEGORY_CNAE_MAPPING, ValidCNAE } from '@/types/category'

export const getCategoryDisplayName = (category: CategoryResponse): string => {
    if (category.cnae && CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]) {
        return CATEGORY_CNAE_MAPPING[category.cnae as ValidCNAE]
    }
    return category.name
}

export const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    })
}

export const formatNumber = (value: number): string => {
    return value.toLocaleString('pt-BR')
}

export const generateCategoryColors = (categories: CategoryResponse[]): Record<number, string> => {
    const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#F97316', // orange
        '#06B6D4', // cyan
        '#84CC16', // lime
        '#EC4899', // pink
        '#6B7280'  // gray
    ]

    const colorMap: Record<number, string> = {}
    categories.forEach((category, index) => {
        colorMap[category.id] = colors[index % colors.length]
    })

    return colorMap
}

export const calculateCategoryMetrics = (categories: CategoryResponse[]) => {
    const totalCategories = categories.length
    const activeCategories = categories.filter(cat => cat.isActive).length
    const inactiveCategories = totalCategories - activeCategories
    const categoriesWithProducts = categories.filter(cat => (cat._count?.products || 0) > 0).length
    const categoriesWithCnae = categories.filter(cat => cat.cnae).length

    return {
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithProducts,
        categoriesWithCnae,
        averageProductsPerCategory: totalCategories > 0
            ? categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0) / totalCategories
            : 0
    }
}

export const exportCategoriesToCSV = (categories: CategoryResponse[]): void => {
    const headers = ['ID', 'Nome', 'Descrição', 'CNAE', 'Status', 'Produtos', 'Criado em']

    const csvContent = [
        headers.join(','),
        ...categories.map(cat => [
            cat.id,
            `"${cat.name}"`,
            `"${cat.description || ''}"`,
            cat.cnae || '',
            cat.isActive ? 'Ativo' : 'Inativo',
            cat._count?.products || 0,
            new Date(cat.createdAt).toLocaleDateString('pt-BR')
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `categorias_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
