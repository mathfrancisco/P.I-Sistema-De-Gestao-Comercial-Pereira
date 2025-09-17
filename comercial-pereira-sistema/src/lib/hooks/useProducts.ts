// hooks/useProducts.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    ProductResponse,
    ProductFilters,
    CreateProductRequest,
    UpdateProductRequest,
    ProductsListResponse,
    ProductSelectOption
} from '@/types/product';

// API functions baseadas nas rotas reais
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
    // GET /api/products - Listar produtos com filtros
    async getProducts(filters: ProductFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const result = await fetchAPI(`/api/products?${params}`);
        return result as { success: boolean } & ProductsListResponse;
    },

    // GET /api/products/[id] - Buscar produto por ID
    async getProductById(id: number, includeStats = false) {
        const params = includeStats ? '?includeStats=true' : '';
        const result = await fetchAPI(`/api/products/${id}${params}`);
        return result as { success: boolean; data: ProductResponse };
    },

    // POST /api/products - Criar produto
    async createProduct(data: CreateProductRequest) {
        const result = await fetchAPI('/api/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result as { success: boolean; data: ProductResponse; message: string };
    },

    // PUT /api/products/[id] - Atualizar produto
    async updateProduct(id: number, data: UpdateProductRequest) {
        const result = await fetchAPI(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return result as { success: boolean; data: ProductResponse; message: string };
    },

    // DELETE /api/products/[id] - Excluir produto
    async deleteProduct(id: number, reason?: string) {
        const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        const result = await fetchAPI(`/api/products/${id}${params}`, {
            method: 'DELETE',
        });
        return result as { success: boolean; message: string };
    },

    // GET /api/products/search - Buscar produtos
    async searchProducts(query: string, categoryId?: number, limit = 10, includeInactive = false, withStock = false) {
        const params = new URLSearchParams({
            q: query,
            limit: String(limit),
            includeInactive: String(includeInactive),
            withStock: String(withStock)
        });
        if (categoryId) params.append('categoryId', String(categoryId));

        const result = await fetchAPI(`/api/products/search?${params}`);
        return result as { success: boolean; data: ProductResponse[] };
    },

    // POST /api/products/check-code - Verificar disponibilidade do código
    async checkCodeAvailability(code: string, excludeId?: number) {
        const result = await fetchAPI('/api/products/check-code', {
            method: 'POST',
            body: JSON.stringify({ code, excludeId }),
        });
        return result as { success: boolean; data: { available: boolean } };
    },

    // GET /api/products/code/[code] - Buscar produto por código
    async getProductByCode(code: string) {
        const result = await fetchAPI(`/api/products/code/${encodeURIComponent(code)}`);
        return result as { success: boolean; data: ProductResponse };
    },

    // GET /api/products/active - Buscar produtos ativos
    async getActiveProducts() {
        const result = await fetchAPI('/api/products/active');
        return result as { success: boolean; data: ProductResponse[] };
    },

    // GET /api/products/category/[categoryId] - Buscar produtos por categoria
    async getProductsByCategory(categoryId: number) {
        const result = await fetchAPI(`/api/products/category/${categoryId}`);
        return result as { success: boolean; data: ProductResponse[] };
    },

    // GET /api/products/select - Buscar produtos para seleção
    async getProductsForSelect(categoryId?: number, withStock = false) {
        const params = new URLSearchParams({ withStock: String(withStock) });
        if (categoryId) params.append('categoryId', String(categoryId));

        const result = await fetchAPI(`/api/products/select?${params}`);
        return result as { success: boolean; data: ProductSelectOption[] };
    },

    // GET /api/products/statistics - Obter estatísticas
    async getStatistics() {
        const result = await fetchAPI('/api/products/statistics');
        return result as { success: boolean; data: any };
    },

    // POST /api/products/bulk-import - Importação em lote
    async bulkImport(data: { products: CreateProductRequest[] }) {
        const result = await fetchAPI('/api/products/bulk-import', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result as { success: boolean; data: { success: number; errors: string[] }; message: string };
    }
};

// Hook principal para listagem de produtos
export const useProducts = (initialFilters: ProductFilters = {}) => {
    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        ...initialFilters,
    });

    const query = useQuery({
        queryKey: ['products', filters],
        queryFn: () => ProductAPI.getProducts(filters),
        staleTime: 5 * 60 * 1000,
    });

    const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    }, []);

    const changePage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const changeSort = useCallback((sortBy: ProductFilters['sortBy'], sortOrder: 'asc' | 'desc') => {
        setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
    }, []);

    return {
        ...query,
        filters,
        updateFilters,
        changePage,
        changeSort,
        products: query.data?.data || [],
        pagination: query.data?.pagination,
        summary: query.data?.summary,
    };
};

// Hook para produto individual
export const useProduct = (id: number | null, includeStats = false) => {
    return useQuery({
        queryKey: ['product', id, includeStats],
        queryFn: () => id ? ProductAPI.getProductById(id, includeStats) : null,
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

// Hook para criar produto
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ProductAPI.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// Hook para atualizar produto
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
            ProductAPI.updateProduct(id, data),
        onSuccess: (_: any, {id}: any) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
        },
    });
};

// Hook para excluir produto
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

// Hook para busca de produtos
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

// Hook para verificar código
export const useCheckCode = () => {
    return useMutation({
        mutationFn: ({ code, excludeId }: { code: string; excludeId?: number }) =>
            ProductAPI.checkCodeAvailability(code, excludeId),
    });
};

// Hook para produto por código
export const useProductByCode = (code: string | null) => {
    return useQuery({
        queryKey: ['product-by-code', code],
        queryFn: () => code ? ProductAPI.getProductByCode(code) : null,
        enabled: !!code,
        staleTime: 10 * 60 * 1000,
    });
};

// Hook para produtos ativos
export const useActiveProducts = () => {
    return useQuery({
        queryKey: ['products', 'active'],
        queryFn: () => ProductAPI.getActiveProducts(),
        staleTime: 15 * 60 * 1000,
    });
};

// Hook para produtos por categoria
export const useProductsByCategory = (categoryId: number | null) => {
    return useQuery({
        queryKey: ['products', 'category', categoryId],
        queryFn: () => categoryId ? ProductAPI.getProductsByCategory(categoryId) : null,
        enabled: !!categoryId,
        staleTime: 15 * 60 * 1000,
    });
};

// Hook para produtos para seleção
export const useProductsForSelect = (categoryId?: number, withStock = false) => {
    return useQuery({
        queryKey: ['products', 'select', categoryId, withStock],
        queryFn: () => ProductAPI.getProductsForSelect(categoryId, withStock),
        staleTime: 10 * 60 * 1000,
    });
};

// Hook para estatísticas
export const useProductStatistics = () => {
    return useQuery({
        queryKey: ['products', 'statistics'],
        queryFn: () => ProductAPI.getStatistics(),
        staleTime: 30 * 60 * 1000,
    });
};

// Hook para importação em lote
export const useBulkImport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ProductAPI.bulkImport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};