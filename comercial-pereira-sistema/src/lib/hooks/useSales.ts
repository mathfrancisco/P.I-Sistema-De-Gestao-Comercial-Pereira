// lib/hooks/useSales.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    SaleResponse,
    SaleFilters,
    CreateSaleRequest,
    UpdateSaleRequest,
    SalesListResponse,
    SaleItemResponse,
    AddSaleItemRequest,
    UpdateSaleItemRequest,
    ValidateStockRequest,
    ValidateStockResponse,
    SaleSelectOption,
    ShoppingCart
} from '@/types/sale';

// ================== HOOK PRINCIPAL DE VENDAS ==================
interface UseSalesOptions {
    customerId?: number;
    userId?: number;
    status?: string;
    autoFetch?: boolean;
}

interface UseSalesReturn {
    sales: SaleResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: SaleFilters;
    summary: {
        totalSales: number;
        totalRevenue: number;
        averageOrderValue: number;
        totalQuantity: number;
    };
    loading: boolean;
    error: string | null;
    updateFilters: (newFilters: Partial<SaleFilters>) => void;
    changePage: (page: number) => void;
    changeSort: (column: string, direction: 'asc' | 'desc') => void;
    refresh: () => void;
}

export const useSales = (options: UseSalesOptions = {}): UseSalesReturn => {
    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
    });
    const [filters, setFilters] = useState<SaleFilters>({
        page: 1,
        limit: 20,
        sortBy: 'saleDate',
        sortOrder: 'desc',
        customerId: options.customerId,
        userId: options.userId,
        status: options.status as any,
        includeItems: false
    });
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalQuantity: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                }
            });

            const response = await fetch(`/api/sales?${params}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar vendas');
            }

            const data: SalesListResponse = await response.json();

            setSales(data.data || []);
            setPagination(data.pagination);
            setSummary(data.summary);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchSales();
        }
    }, [fetchSales, options.autoFetch]);

    const updateFilters = useCallback((newFilters: Partial<SaleFilters>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page || 1
        }));
    }, []);

    const changePage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const changeSort = useCallback((column: string, direction: 'asc' | 'desc') => {
        setFilters(prev => ({
            ...prev,
            sortBy: column as any,
            sortOrder: direction,
            page: 1
        }));
    }, []);

    const refresh = useCallback(() => {
        fetchSales();
    }, [fetchSales]);

    return {
        sales,
        pagination,
        filters,
        summary,
        loading,
        error,
        updateFilters,
        changePage,
        changeSort,
        refresh
    };
};

// ================== HOOK PARA CRIAR VENDA ==================
export const useCreateSale = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSale = async (data: CreateSaleRequest): Promise<SaleResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar venda');
            }

            const sale = await response.json();
            toast.success('Venda criada com sucesso!');
            return sale;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createSale, loading, error };
};

// ================== HOOK PARA ATUALIZAR VENDA ==================
export const useUpdateSale = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSale = async (id: number, data: UpdateSaleRequest): Promise<SaleResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao atualizar venda');
            }

            const sale = await response.json();
            toast.success('Venda atualizada com sucesso!');
            return sale;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateSale, loading, error };
};

// ================== HOOK PARA BUSCAR UMA VENDA ==================
export const useSale = (saleId: number | null) => {
    const [sale, setSale] = useState<SaleResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSale = useCallback(async () => {
        if (!saleId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar venda');
            }

            const data = await response.json();
            setSale(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, [saleId]);

    useEffect(() => {
        fetchSale();
    }, [fetchSale]);

    return { sale, loading, error, refresh: fetchSale };
};

// ================== HOOK PARA VALIDAR ESTOQUE ==================
export const useValidateStock = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateStock = async (data: ValidateStockRequest): Promise<ValidateStockResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/sales/validate-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao validar estoque');
            }

            return await response.json();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { validateStock, loading, error };
};

// ================== HOOK PARA GERENCIAR ITENS DE VENDA ==================
export const useSaleItems = (saleId: number | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addItem = async (data: AddSaleItemRequest): Promise<SaleItemResponse> => {
        if (!saleId) throw new Error('ID da venda é obrigatório');

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao adicionar item');
            }

            const item = await response.json();
            toast.success('Item adicionado com sucesso!');
            return item;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (itemId: number, data: UpdateSaleItemRequest): Promise<SaleItemResponse> => {
        if (!saleId) throw new Error('ID da venda é obrigatório');

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao atualizar item');
            }

            const item = await response.json();
            toast.success('Item atualizado com sucesso!');
            return item;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId: number): Promise<void> => {
        if (!saleId) throw new Error('ID da venda é obrigatório');

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}/items/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao remover item');
            }

            toast.success('Item removido com sucesso!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { addItem, updateItem, removeItem, loading, error };
};

// ================== HOOK PARA AÇÕES DE VENDA ==================
export const useSaleActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmSale = async (saleId: number): Promise<SaleResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}/confirm`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao confirmar venda');
            }

            const sale = await response.json();
            toast.success('Venda confirmada com sucesso!');
            return sale;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const completeSale = async (saleId: number): Promise<SaleResponse> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}/complete`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao completar venda');
            }

            const sale = await response.json();
            toast.success('Venda finalizada com sucesso!');
            return sale;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelSale = async (saleId: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sales/${saleId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao cancelar venda');
            }

            toast.success('Venda cancelada com sucesso!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { confirmSale, completeSale, cancelSale, loading, error };
};

// ================== HOOK PARA CARRINHO DE COMPRAS ==================
export const useShoppingCart = () => {
    const [cart, setCart] = useState<ShoppingCart>({
        items: [],
        totals: {
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0
        },
        validationErrors: []
    });

    const addToCart = useCallback((product: any, quantity: number = 1) => {
        setCart(prev => {
            const existingItemIndex = prev.items.findIndex(item => item.productId === product.id);

            if (existingItemIndex >= 0) {
                // Update existing item
                const updatedItems = [...prev.items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity,
                    total: (updatedItems[existingItemIndex].quantity + quantity) * updatedItems[existingItemIndex].unitPrice - updatedItems[existingItemIndex].discount
                };

                return {
                    ...prev,
                    items: updatedItems
                };
            } else {
                // Add new item
                const newItem = {
                    productId: product.id,
                    productName: product.name,
                    productCode: product.code,
                    quantity,
                    unitPrice: product.price,
                    discount: 0,
                    total: quantity * product.price,
                    availableStock: product.stock
                };

                return {
                    ...prev,
                    items: [...prev.items, newItem]
                };
            }
        });
    }, []);

    const updateCartItem = useCallback((productId: number, updates: Partial<typeof cart.items[0]>) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.productId === productId
                    ? {
                        ...item,
                        ...updates,
                        total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) - (updates.discount || item.discount)
                    }
                    : item
            )
        }));
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.filter(item => item.productId !== productId)
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart({
            items: [],
            totals: {
                subtotal: 0,
                discount: 0,
                tax: 0,
                total: 0
            },
            validationErrors: []
        });
    }, []);

    const setCustomer = useCallback((customerId: number) => {
        setCart(prev => ({
            ...prev,
            customerId
        }));
    }, []);

    // Recalculate totals when items change
    useEffect(() => {
        const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal - cart.totals.discount + cart.totals.tax;

        setCart(prev => ({
            ...prev,
            totals: {
                ...prev.totals,
                subtotal,
                total
            }
        }));
    }, [cart.items]);

    return {
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        setCustomer
    };
};

// ================== HOOK PARA VENDAS EM FORMATO SELECT ==================
export const useSalesForSelect = (customerId?: number) => {
    const [options, setOptions] = useState<SaleSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOptions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                limit: '100',
                sortBy: 'saleDate',
                sortOrder: 'desc'
            });

            if (customerId) {
                params.set('customerId', String(customerId));
            }

            const response = await fetch(`/api/sales?${params}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar vendas');
            }

            const data: SalesListResponse = await response.json();

            const saleOptions: SaleSelectOption[] = data.data.map((sale: SaleResponse) => ({
                value: sale.id,
                label: `Venda #${sale.id} - ${sale.customer.name}`,
                total: sale.total,
                status: sale.status,
                date: sale.saleDate
            }));

            setOptions(saleOptions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    return { options, loading, error, refresh: fetchOptions };
};