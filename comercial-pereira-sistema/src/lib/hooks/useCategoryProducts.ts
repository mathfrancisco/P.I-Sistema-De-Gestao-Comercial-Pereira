// lib/hooks/useCategoryProducts.ts
import { useState, useEffect } from 'react'
import { ProductResponse } from '@/types/product'

interface CategoryProductsResponse {
    products: ProductResponse[]  // Use ProductResponse em vez de Product
    total: number
    category: {
        id: number
        name: string
    }
}

interface UseCategoryProductsReturn {
    products: ProductResponse[]  // Use ProductResponse em vez de Product
    loading: boolean
    error: string | null
    total: number
    currentPage: number
    totalPages: number
    setPage: (page: number) => void
    setSearch: (search: string) => void
    refresh: () => void
}

export const useCategoryProducts = (
    categoryId: number,
    initialLimit: number = 10
): UseCategoryProductsReturn => {
    const [products, setProducts] = useState<ProductResponse[]>([])  // Use ProductResponse
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [search, setSearch] = useState('')

    const limit = initialLimit
    const totalPages = Math.ceil(total / limit)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                search,
                sortBy: 'name',
                sortOrder: 'asc'
            })

            const response = await fetch(`/api/categories/${categoryId}/products?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar produtos')
            }

            const data: CategoryProductsResponse = await response.json()
            setProducts(data.products)
            setTotal(data.total || 0)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (categoryId) {
            fetchProducts()
        }
    }, [categoryId, currentPage, search])

    const setPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return {
        products,
        loading,
        error,
        total,
        currentPage,
        totalPages,
        setPage,
        setSearch: (newSearch: string) => {
            setSearch(newSearch)
            setCurrentPage(1) // Reset to first page when searching
        },
        refresh: fetchProducts
    }
}