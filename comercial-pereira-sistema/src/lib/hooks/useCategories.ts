// lib/hooks/useCategories.ts - VERSÃO FINAL CORRIGIDA PARA SUA API
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    CategoryResponse,
    CategoryFilters,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from '@/types/category';

// Estender CategoryFilters para incluir search e includeProductCount
interface ExtendedCategoryFilters extends CategoryFilters {
    search?: string;
    includeProductCount?: boolean;
}

// Função para normalizar filtros de categorias
const normalizeCategoryFilters = (filters: ExtendedCategoryFilters): ExtendedCategoryFilters => {
    const normalized: ExtendedCategoryFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
                normalized[key as keyof ExtendedCategoryFilters] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
                normalized[key as keyof ExtendedCategoryFilters] = value.trim();
            }
        }
    });

    return normalized;
};

// Função para criar query key estável para categorias
const createCategoryQueryKey = (filters: ExtendedCategoryFilters): (string | number)[] => {
    const normalized = normalizeCategoryFilters(filters);

    const sortedEntries = Object.entries(normalized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`);

    return ['categories', ...sortedEntries];
};

// API functions para categorias
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

const CategoryAPI = {
    async getCategories(searchTerm: string = '', filters: ExtendedCategoryFilters = {}) {
        const params = new URLSearchParams();

        if (searchTerm) params.append('search', searchTerm);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.hasCnae !== undefined) params.append('hasCnae', filters.hasCnae.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

        // CORREÇÃO: includeProductCount sempre true por padrão
        params.append('includeProductCount', (filters.includeProductCount !== false).toString());

        const result = await fetchAPI(`/api/categories?${params}`);
        return result;
    },

    async createCategory(data: CreateCategoryRequest) {
        const result = await fetchAPI('/api/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result;
    },

    async updateCategory(id: number, data: UpdateCategoryRequest) {
        const result = await fetchAPI(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return result;
    },

    async deleteCategory(id: number) {
        const result = await fetchAPI(`/api/categories/${id}`, {
            method: 'DELETE',
        });
        return result;
    }
};

interface UseCategoriesReturn {
    categories: CategoryResponse[]
    loading: boolean
    error: string | null
    total: number
    isLoading: boolean  // alias
    isError: boolean
    refresh: () => void
    refetch: () => void  // alias
    createCategory: (data: CreateCategoryRequest) => Promise<CategoryResponse>
    updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<CategoryResponse>
    deleteCategory: (id: number) => Promise<void>
    toggleCategoryStatus: (id: number) => Promise<void>
}

// Hook principal corrigido para evitar loop infinito
export const useCategories = (
    searchTerm: string = '',
    filters: ExtendedCategoryFilters = {}
): UseCategoriesReturn => {
    // Normalizar e estabilizar parâmetros
    const stableSearchTerm = useMemo(() => {
        return searchTerm?.trim() || '';
    }, [searchTerm]);

    // CORREÇÃO: Sempre incluir includeProductCount por padrão
    const stableFilters = useMemo(() => {
        return normalizeCategoryFilters({
            includeProductCount: true, // Padrão
            ...filters
        });
    }, [filters]);

    // Query key estável
    const queryKey = useMemo(() => {
        return createCategoryQueryKey({
            search: stableSearchTerm,
            ...stableFilters
        });
    }, [stableSearchTerm, stableFilters]);

    // Query principal com configurações anti-loop
    const query = useQuery({
        queryKey,
        queryFn: () => CategoryAPI.getCategories(stableSearchTerm, stableFilters),
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
    });

    // QueryClient para mutations
    const queryClient = useQueryClient();

    // CORREÇÃO CRÍTICA: Memoizar dados baseados na estrutura REAL da sua API
    const categories = useMemo(() => {
        // Sua API retorna: { categories: [...] }
        return query.data?.categories || [];
    }, [query.data]);

    const total = useMemo(() => {
        // Sua API retorna: { total: 8 }
        return query.data?.total || 0;
    }, [query.data]);

    // Função de refresh estável
    const refresh = useCallback(() => {
        query.refetch();
    }, [query]);

    // Mutations
    const createCategoryMutation = useMutation({
        mutationFn: CategoryAPI.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
            CategoryAPI.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: CategoryAPI.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    // Funções wrapper para manter compatibilidade
    const createCategory = useCallback(async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
        const result = await createCategoryMutation.mutateAsync(data);
        return result;
    }, [createCategoryMutation]);

    const updateCategory = useCallback(async (id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
        const result = await updateCategoryMutation.mutateAsync({ id, data });
        return result;
    }, [updateCategoryMutation]);

    const deleteCategory = useCallback(async (id: number): Promise<void> => {
        await deleteCategoryMutation.mutateAsync(id);
    }, [deleteCategoryMutation]);

    const toggleCategoryStatus = useCallback(async (id: number): Promise<void> => {
        const category = categories.find(cat => cat.id === id);
        if (!category) return;

        await updateCategory(id, { isActive: !category.isActive });
    }, [categories, updateCategory]);

    // Debug logs (remover em produção)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Categories Filters changed:', {
                search: stableSearchTerm,
                filters: stableFilters
            });
        }
    }, [stableSearchTerm, stableFilters]);

    return {
        categories,
        loading: query.isLoading,
        error: query.error?.message || null,
        total,
        isLoading: query.isLoading, // alias
        isError: query.isError,
        refresh,
        refetch: refresh, // alias
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus
    };
};

// Hook adicional para categorias ativas (usado frequentemente em selects)
export const useActiveCategories = () => {
    return useQuery({
        queryKey: ['categories', 'active'],
        queryFn: () => CategoryAPI.getCategories('', { isActive: true, includeProductCount: true }),
        staleTime: 15 * 60 * 1000, // 15 minutos - dados mais estáveis
        gcTime: 30 * 60 * 1000,
    });
};

// Hook para categoria individual
export const useCategory = (id: number | null) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: async () => {
            if (!id) return null;
            const result = await fetchAPI(`/api/categories/${id}`);
            return result;
        },
        enabled: !!id && id > 0,
        staleTime: 10 * 60 * 1000,
    });
};