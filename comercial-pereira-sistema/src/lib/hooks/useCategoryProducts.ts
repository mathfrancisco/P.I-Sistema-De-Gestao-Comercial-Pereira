// lib/hooks/useCategoryProducts.ts - VERSÃO CORRIGIDA COM REACT QUERY
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductResponse } from '@/types/product';

interface CategoryProductsFilters {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'code' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

interface CategoryProductsResponse {
    products: ProductResponse[];
    total: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    category: {
        id: number;
        name: string;
    };
}

interface UseCategoryProductsReturn {
    products: ProductResponse[];
    loading: boolean;
    error: string | null;
    total: number;
    currentPage: number;
    totalPages: number;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    refresh: () => void;
    category: { id: number; name: string } | null;
    isLoading: boolean; // alias
    refetch: () => void; // alias
}

// Função para normalizar filtros de categoria
const normalizeCategoryProductFilters = (filters: CategoryProductsFilters): CategoryProductsFilters => {
    const normalized: CategoryProductsFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
                normalized[key as keyof CategoryProductsFilters] = value;
            } else if (typeof value === 'number') {
                normalized[key as keyof CategoryProductsFilters] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
                normalized[key as keyof CategoryProductsFilters] = value.trim();
            }
        }
    });

    return normalized;
};

// Função para criar query key estável
const createCategoryProductsQueryKey = (categoryId: number, filters: CategoryProductsFilters): (string | number)[] => {
    const normalized = normalizeCategoryProductFilters(filters);

    const sortedEntries = Object.entries(normalized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`);

    return ['category-products', categoryId, ...sortedEntries];
};

// API function
const fetchAPI = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
};

const CategoryProductsAPI = {
    async getCategoryProducts(categoryId: number, filters: CategoryProductsFilters = {}) {
        const params = new URLSearchParams();

        const normalizedFilters = normalizeCategoryProductFilters(filters);

        Object.entries(normalizedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'boolean') {
                    params.append(key, value.toString());
                } else {
                    params.append(key, String(value));
                }
            }
        });

        const result = await fetchAPI(`/api/categories/${categoryId}/products?${params}`);
        return result as CategoryProductsResponse;
    }
};

export const useCategoryProducts = (
    categoryId: number,
    initialLimit: number = 12 // Alterei para 12 como no código original
): UseCategoryProductsReturn => {
    // Estados locais para filtros
    const [search, setSearchState] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filtros estáveis e normalizados
    const filters = useMemo(() => ({
        search,
        page: currentPage,
        limit: initialLimit,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
    }), [search, currentPage, initialLimit]);

    const previousFiltersRef = useRef(filters);
    const stableFilters = useMemo(() => {
        const normalized = normalizeCategoryProductFilters(filters);

        const hasChanged = JSON.stringify(previousFiltersRef.current) !== JSON.stringify(normalized);

        if (hasChanged) {
            previousFiltersRef.current = normalized;
            return normalized;
        }

        return previousFiltersRef.current;
    }, [filters]);

    // Query key estável
    const queryKey = useMemo(() => {
        return createCategoryProductsQueryKey(categoryId, stableFilters);
    }, [categoryId, stableFilters]);

    // Query principal com configurações anti-loop
    const query = useQuery({
        queryKey,
        queryFn: () => CategoryProductsAPI.getCategoryProducts(categoryId, stableFilters),
        enabled: !!categoryId && categoryId > 0,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
    });

    // Handlers estáveis
    const setPage = useCallback((page: number) => {
        const totalPages = query.data?.pagination?.pages || 1;
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [query.data?.pagination?.pages]);

    const setSearch = useCallback((newSearch: string) => {
        setSearchState(newSearch);
        setCurrentPage(1); // Reset para primeira página ao buscar
    }, []);

    const refresh = useCallback(() => {
        query.refetch();
    }, [query]);

    // Dados memoizados
    const products = useMemo(() => {
        return query.data?.products || [];
    }, [query.data]);

    const total = useMemo(() => {
        return query.data?.total || 0;
    }, [query.data]);

    const totalPages = useMemo(() => {
        return query.data?.pagination?.pages || 0;
    }, [query.data]);

    const category = useMemo(() => {
        return query.data?.category || null;
    }, [query.data]);

    // Debug logs (remover em produção)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🏷️ Category Products - Filters changed:', {
                categoryId,
                filters: stableFilters
            });
        }
    }, [categoryId, stableFilters]);

    return {
        products,
        loading: query.isLoading,
        error: query.error?.message || null,
        total,
        currentPage,
        totalPages,
        setPage,
        setSearch,
        refresh,
        category,
        isLoading: query.isLoading, // alias
        refetch: refresh, // alias
    };
};