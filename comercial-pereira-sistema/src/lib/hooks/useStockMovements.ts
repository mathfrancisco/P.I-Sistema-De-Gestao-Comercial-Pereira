import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    MovementFilters,
    MovementListResponse,
    StockMovementRequest,
    MovementResponse
} from '@/types/inventory';

export const useStockMovements = (initialFilters?: MovementFilters) => {
    const [filters, setFilters] = useState<MovementFilters>(initialFilters || {});
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery<MovementListResponse>({
        queryKey: ['stock-movements', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const response = await fetch(`/api/inventory/movements?${params}`);
            if (!response.ok) throw new Error('Failed to fetch movements');
            const result = await response.json();
            return result.data;
        },
    });

    const createMovement = useMutation({
        mutationFn: async (data: StockMovementRequest) => {
            const response = await fetch('/api/inventory/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create movement');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Movimentação registrada com sucesso');
        },
        onError: () => {
            toast.error('Erro ao registrar movimentação');
        },
    });

    return {
        movements: data?.data || [],
        pagination: data?.pagination,
        filters,
        isLoading,
        error,
        updateFilters: (newFilters: Partial<MovementFilters>) => {
            setFilters(prev => ({ ...prev, ...newFilters }));
        },
        createMovement: createMovement.mutate,
        refetch,
    };
};