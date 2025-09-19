import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    InventoryFilters,
    InventoryListResponse,
    UpdateInventoryRequest,
    StockAdjustmentRequest,
    StockMovementRequest,
    InventoryResponse
} from '@/types/inventory';

const API_BASE_URL = '/api/inventory';

export const useInventory = (initialFilters?: InventoryFilters) => {
    const [filters, setFilters] = useState<InventoryFilters>(initialFilters || {});
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery<InventoryListResponse>({
        queryKey: ['inventory', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch inventory');
            const result = await response.json();
            return result.data;
        },
    });

    const updateInventory = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateInventoryRequest }) => {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update inventory');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Inventário atualizado com sucesso');
        },
        onError: () => {
            toast.error('Erro ao atualizar inventário');
        },
    });

    const adjustStock = useMutation({
        mutationFn: async (data: StockAdjustmentRequest) => {
            const response = await fetch(`${API_BASE_URL}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to adjust stock');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
            toast.success('Ajuste de estoque realizado');
        },
        onError: () => {
            toast.error('Erro ao ajustar estoque');
        },
    });

    const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({});
    }, []);

    return {
        inventory: data?.data || [],
        pagination: data?.pagination,
        alerts: data?.alerts,
        filters,
        isLoading,
        error,
        updateFilters,
        resetFilters,
        updateInventory: updateInventory.mutate,
        adjustStock: adjustStock.mutate,
        refetch,
    };
};