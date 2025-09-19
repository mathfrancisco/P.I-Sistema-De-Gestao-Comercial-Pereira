import { useQuery } from '@tanstack/react-query';
import { InventoryStatsResponse } from '@/types/inventory';

export const useInventoryStats = () => {
    return useQuery<InventoryStatsResponse>({
        queryKey: ['inventory-stats'],
        queryFn: async () => {
            const response = await fetch('/api/inventory/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const result = await response.json();
            return result.data;
        },
        refetchInterval: 300000, // Refresh every 5 minutes
    });
};