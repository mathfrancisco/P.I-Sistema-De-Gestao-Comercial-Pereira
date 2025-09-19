import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StockAdjustmentRequest } from '@/types/inventory';

export const useStockAdjustment = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const adjustmentMutation = useMutation({
        mutationFn: async (data: StockAdjustmentRequest) => {
            const response = await fetch('/api/inventory/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to adjust stock');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
            toast.success('Ajuste de estoque realizado com sucesso');
            setIsOpen(false);
            setSelectedProduct(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao ajustar estoque');
        },
    });

    const openAdjustment = (productId?: number) => {
        setSelectedProduct(productId || null);
        setIsOpen(true);
    };

    const closeAdjustment = () => {
        setIsOpen(false);
        setSelectedProduct(null);
    };

    return {
        isOpen,
        selectedProduct,
        openAdjustment,
        closeAdjustment,
        adjustStock: adjustmentMutation.mutate,
        isLoading: adjustmentMutation.isPending,
    };
};