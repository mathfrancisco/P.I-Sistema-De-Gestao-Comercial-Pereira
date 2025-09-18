// hooks/useCategories.ts
import { useState, useEffect, useCallback } from 'react'
import { CategoryResponse, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'

interface UseCategoriesReturn {
    categories: CategoryResponse[]
    loading: boolean
    error: string | null
    total: number
    refresh: () => Promise<void>
    createCategory: (data: CreateCategoryRequest) => Promise<CategoryResponse>
    updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<CategoryResponse>
    deleteCategory: (id: number) => Promise<void>
    toggleCategoryStatus: (id: number) => Promise<void>
}

export const useCategories = (
    searchTerm: string = '',
    filters: CategoryFilters = {}
): UseCategoriesReturn => {
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
            if (filters.hasCnae !== undefined) params.append('hasCnae', filters.hasCnae.toString())
            if (filters.sortBy) params.append('sortBy', filters.sortBy)
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
            params.append('includeProductCount', 'true')

            const response = await fetch(`/api/categories?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar categorias')
            }

            const data = await response.json()
            setCategories(data.categories)
            setTotal(data.total)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [searchTerm, filters])

    const createCategory = async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro ao criar categoria')
        }

        const newCategory = await response.json()
        setCategories(prev => [newCategory, ...prev])
        setTotal(prev => prev + 1)

        return newCategory
    }

    const updateCategory = async (id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
        const response = await fetch(`/api/categories/${id}`, {
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
        setCategories(prev => prev.map(cat =>
            cat.id === id ? updatedCategory : cat
        ))

        return updatedCategory
    }

    const deleteCategory = async (id: number): Promise<void> => {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro ao deletar categoria')
        }

        setCategories(prev => prev.filter(cat => cat.id !== id))
        setTotal(prev => prev - 1)
    }

    const toggleCategoryStatus = async (id: number): Promise<void> => {
        const category = categories.find(cat => cat.id === id)
        if (!category) return

        await updateCategory(id, { isActive: !category.isActive })
    }

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return {
        categories,
        loading,
        error,
        total,
        refresh: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus
    }
}

