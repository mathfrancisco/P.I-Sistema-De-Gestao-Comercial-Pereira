import { useQuery } from '@tanstack/react-query';
import { InventoryResponse, MovementResponse, StockCheckResponse } from '@/types/inventory';

export const useProductStock = (productId: number, enabled = true) => {
    const inventory = useQuery<InventoryResponse>({
        queryKey: ['product-inventory', productId],
        queryFn: async () => {
            const response = await fetch(`/api/inventory/product/${productId}`);
            if (!response.ok) throw new Error('Failed to fetch product inventory');
            const result = await response.json();
            return result.data;
        },
        enabled,
    });

    const movements = useQuery<MovementResponse[]>({
        queryKey: ['product-movements', productId],
        queryFn: async () => {
            const response = await fetch(`/api/inventory/product/${productId}/movements`);
            if (!response.ok) throw new Error('Failed to fetch product movements');
            const result = await response.json();
            return result.data;
        },
        enabled,
    });

    const stockCheck = useQuery<StockCheckResponse>({
        queryKey: ['product-stock-check', productId],
        queryFn: async () => {
            const response = await fetch(`/api/inventory/product/${productId}/stock-check`);
            if (!response.ok) throw new Error('Failed to check stock');
            const result = await response.json();
            return result.data;
        },
        enabled,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return {
        inventory: inventory.data,
        movements: movements.data || [],
        stockCheck: stockCheck.data,
        isLoading: inventory.isLoading || movements.isLoading || stockCheck.isLoading,
        error: inventory.error || movements.error || stockCheck.error,
    };
};