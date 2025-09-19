import { useQuery } from '@tanstack/react-query';
import { InventoryAlert } from '@/types/inventory';

export const useInventoryAlerts = (type: 'low-stock' | 'out-of-stock' = 'low-stock') => {
    return useQuery<InventoryAlert[]>({
        queryKey: ['inventory-alerts', type],
        queryFn: async () => {
            const response = await fetch(`/api/inventory/alerts?type=${type}`);
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const result = await response.json();
            return result.data;
        },
        refetchInterval: 180000, // Refresh every 3 minutes
    });
};