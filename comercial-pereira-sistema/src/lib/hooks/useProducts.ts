// lib/hooks/useProducts.ts - VERSÃO FINAL CORRIGIDA PARA SUA API
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    ProductFilters,
    CreateProductRequest,
    UpdateProductRequest,
    BulkImportRequest,
} from '@/types/product';

// Função para normalizar filtros
const normalizeFilters = (filters: ProductFilters): ProductFilters => {
    const normalized: ProductFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
                normalized[key as keyof ProductFilters] = value;
            } else if (typeof value === 'number') {
                normalized[key as keyof ProductFilters] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
                normalized[key as keyof ProductFilters] = value.trim();
            } else if (value instanceof Date) {
                normalized[key as keyof ProductFilters] = value;
            }
        }
    });

    return normalized;
};

// Função para gerar query key estável
const createQueryKey = (filters: ProductFilters): (string | number)[] => {
    const normalized = normalizeFilters(filters);

    const sortedEntries = Object.entries(normalized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`);

    return ['products', ...sortedEntries];
};

// API functions
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

const ProductAPI = {
    async getProducts(filters: ProductFilters = {}) {
        const params = new URLSearchParams();

        const normalizedFilters = normalizeFilters(filters);

        Object.entries(normalizedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'boolean') {
                    params.append(key, value.toString());
                } else {
                    params.append(key, String(value));
                }
            }
        });

        const result = await fetchAPI(`/api/products?${params}`);
        return result;
    },

    async getProductById(id: number, includeStats = false) {
        const params = includeStats ? '?includeStats=true' : '';
        const result = await fetchAPI(`/api/products/${id}${params}`);
        return result;
    },

    async createProduct(data: CreateProductRequest) {
        const result = await fetchAPI('/api/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result;
    },

    async updateProduct(id: number, data: UpdateProductRequest) {
        const result = await fetchAPI(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return result;
    },

    async deleteProduct(id: number, reason?: string) {
        const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        const result = await fetchAPI(`/api/products/${id}${params}`, {
            method: 'DELETE',
        });
        return result;
    },

    async searchProducts(
        query: string,
        categoryId?: number,
        limit = 10,
        includeInactive = false,
        withStock = false
    ) {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString(),
            includeInactive: includeInactive.toString(),
            withStock: withStock.toString()
        });

        if (categoryId) {
            params.append('categoryId', categoryId.toString());
        }

        const result = await fetchAPI(`/api/products/search?${params}`);
        return result;
    },

    async getProductByCode(code: string) {
        const result = await fetchAPI(`/api/products/code/${encodeURIComponent(code)}`);
        return result;
    },

    async checkCodeAvailability(code: string, excludeId?: number) {
        const result = await fetchAPI('/api/products/check-code', {
            method: 'POST',
            body: JSON.stringify({ code, excludeId }),
        });
        return result;
    },

    async getActiveProducts() {
        const result = await fetchAPI('/api/products/active');
        return result;
    },

    async getProductsByCategory(categoryId: number) {
        const result = await fetchAPI(`/api/categories/${categoryId}/products`);
        return result;
    },

    async getProductsForSelect(categoryId?: number, withStock = false) {
        const params = new URLSearchParams({ withStock: String(withStock) });
        if (categoryId) params.append('categoryId', String(categoryId));

        const result = await fetchAPI(`/api/products/select?${params}`);
        return result;
    },

    async getProductStatistics() {
        const result = await fetchAPI('/api/products/statistics');
        return result;
    },

    async bulkImport(data: BulkImportRequest) {
        const result = await fetchAPI('/api/products/bulk-import', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result;
    }
};

// Hook principal para listagem de produtos - VERSÃO CORRIGIDA PARA SUA API
export const useProducts = (initialFilters: ProductFilters = {}) => {
    const defaultFilters = useMemo(() => ({
        page: 1,
        limit: 20,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
    }), []);

    const [filters, setFilters] = useState<ProductFilters>(() => {
        const merged = { ...defaultFilters, ...normalizeFilters(initialFilters) };
        return merged;
    });

    const previousFiltersRef = useRef<ProductFilters>(filters);
    const stableFilters = useMemo(() => {
        const normalized = normalizeFilters(filters);

        const hasChanged = JSON.stringify(previousFiltersRef.current) !== JSON.stringify(normalized);

        if (hasChanged) {
            previousFiltersRef.current = normalized;
            return normalized;
        }

        return previousFiltersRef.current;
    }, [filters]);

    const queryKey = useMemo(() => {
        return createQueryKey(stableFilters);
    }, [stableFilters]);

    const query = useQuery({
        queryKey,
        queryFn: () => ProductAPI.getProducts(stableFilters),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
    });

    const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };

            const hasNonPageChanges = Object.keys(newFilters).some(key => key !== 'page');
            if (hasNonPageChanges) {
                updated.page = 1;
            }

            return updated;
        });
    }, []);

    const changePage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const changeSort = useCallback((sortBy: ProductFilters['sortBy'], sortOrder: 'asc' | 'desc') => {
        setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, [defaultFilters]);

    const refresh = useCallback(() => {
        query.refetch();
    }, [query]);

    // CORREÇÃO CRÍTICA: Lidar com duplo aninhamento da sua API
    const products = useMemo(() => {
        // Sua API retorna: { data: { data: [...] } }
        const responseData = query.data?.data?.data;
        if (Array.isArray(responseData)) {
            return responseData;
        }
        return [];
    }, [query.data]);

    const pagination = useMemo(() => {
        // Sua API retorna: { data: { pagination: {...} } }
        return query.data?.data?.pagination || null;
    }, [query.data]);

    const summary = useMemo(() => {
        // Sua API retorna: { data: { summary: {...} } }
        return query.data?.data?.summary || null;
    }, [query.data]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Products Filters changed:', stableFilters);
        }
    }, [stableFilters]);

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isSuccess: query.isSuccess,
        loading: query.isLoading,
        products,
        pagination,
        summary,
        filters: stableFilters,
        updateFilters,
        changePage,
        changeSort,
        clearFilters,
        refresh,
        refetch: query.refetch,
    };
};

// Demais hooks permanecem iguais...
export const useProduct = (id: number | null, includeStats: boolean = false) => {
    return useQuery({
        queryKey: ['product', id, includeStats],
        queryFn: () => id ? ProductAPI.getProductById(id, includeStats) : null,
        enabled: !!id && id > 0,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ProductAPI.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
            ProductAPI.updateProduct(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            ProductAPI.deleteProduct(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useBulkImport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ProductAPI.bulkImport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// Outros hooks...
export const useSearchProducts = () => {
    return useMutation({
        mutationFn: ({ query, categoryId, limit, includeInactive, withStock }: {
            query: string;
            categoryId?: number;
            limit?: number;
            includeInactive?: boolean;
            withStock?: boolean;
        }) => ProductAPI.searchProducts(query, categoryId, limit, includeInactive, withStock),
    });
};

export const useCheckCode = () => {
    return useMutation({
        mutationFn: ({ code, excludeId }: { code: string; excludeId?: number }) =>
            ProductAPI.checkCodeAvailability(code, excludeId),
    });
};

export const useActiveProducts = () => {
    return useQuery({
        queryKey: ['products', 'active'],
        queryFn: () => ProductAPI.getActiveProducts(),
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useProductsByCategory = (categoryId: number | null) => {
    return useQuery({
        queryKey: ['products', 'category', categoryId],
        queryFn: () => categoryId ? ProductAPI.getProductsByCategory(categoryId) : null,
        enabled: !!categoryId && categoryId > 0,
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useProductsForSelect = (categoryId?: number, withStock = false) => {
    return useQuery({
        queryKey: ['products', 'select', categoryId, withStock],
        queryFn: () => ProductAPI.getProductsForSelect(categoryId, withStock),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
    });
};

export const useProductStatistics = () => {
    return useQuery({
        queryKey: ['products', 'statistics'],
        queryFn: () => ProductAPI.getProductStatistics(),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });
};