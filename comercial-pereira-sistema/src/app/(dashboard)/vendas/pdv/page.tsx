// app/(dashboard)/pdv/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ResponsivePOSLayout } from '@/components/sales/POSLayout';
import { ProductSearchPanel } from '@/components/sales/ProductSearchPanel';
import { ShoppingCart } from '@/components/sales/ShoppingCart';
import { SaleConfirmationModal } from '@/components/sales/SaleConfirmationModal';
import {
    useShoppingCart,
    useCreateSale,
    useValidateStock,
    useSaleActions
} from '@/lib/hooks/useSales';
import {
    calculateItemTotal,
    calculateSaleTotal,
    calculateDiscountAmount,
    DiscountType
} from '@/types/sale';
import type {
    ProductResponse,
    CustomerResponse,
    CreateSaleRequest,
    SaleResponse
} from '@/types/product';

export default function PDVPage() {
    // Estados principais
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
    const [completedSale, setCompletedSale] = useState<SaleResponse | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);

    // Hooks customizados
    const { cart, addToCart, updateCartItem, removeFromCart, clearCart, setCustomer } = useShoppingCart();
    const { createSale, loading: creatingS Sale } = useCreateSale();
    const { validateStock } = useValidateStock();

    // Handlers para produtos
    const handleAddToCart = useCallback((product: ProductResponse, quantity: number = 1) => {
        addToCart(product, quantity);
        toast.success(`${product.name} adicionado ao carrinho`);
    }, [addToCart]);

    const handleUpdateCartItem = useCallback((productId: number, updates: { quantity?: number; discount?: number }) => {
        updateCartItem(productId, updates);
    }, [updateCartItem]);

    const handleRemoveFromCart = useCallback((productId: number) => {
        removeFromCart(productId);
        toast.info('Item removido do carrinho');
    }, [removeFromCart]);

    // Handlers para cliente
    const handleCustomerSelect = useCallback((customer: CustomerResponse) => {
        setSelectedCustomer(customer);
        setCustomer(customer.id);
        toast.success(`Cliente selecionado: ${customer.name}`);
    }, [setCustomer]);

    const handleCustomerClear = useCallback(() => {
        setSelectedCustomer(null);
        setCustomer(undefined);
    }, [setCustomer]);

    // Handlers para desconto e taxa
    const handleDiscountApply = useCallback((type: DiscountType, value: number) => {
        const discountAmount = calculateDiscountAmount(cart.totals.subtotal, type, value);

        // Atualizar desconto no carrinho
        // Em uma implementação real, isso seria feito através do hook useShoppingCart
        toast.success(`Desconto de R$ ${discountAmount.toFixed(2)} aplicado`);
    }, [cart.totals.subtotal]);

    const handleTaxApply = useCallback((value: number) => {
        // Aplicar taxa/frete
        toast.success(`Taxa de R$ ${value.toFixed(2)} aplicada`);
    }, []);

    // Handler para favoritos
    const handleToggleFavorite = useCallback((productId: number) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    // Handler principal para confirmar venda
    const handleConfirmSale = useCallback(async () => {
        if (!selectedCustomer) {
            toast.error('Selecione um cliente para continuar');
            return;
        }

        if (cart.items.length === 0) {
            toast.error('Adicione produtos ao carrinho');
            return;
        }

        try {
            // Validar estoque antes de criar a venda
            const stockValidation = await validateStock({
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });

            if (!stockValidation.valid) {
                stockValidation.errors.forEach(error => {
                    toast.error(error.message);
                });
                return;
            }

            // Criar dados da venda
            const saleData: CreateSaleRequest = {
                customerId: selectedCustomer.id,
                discount: cart.totals.discount,
                tax: cart.totals.tax,
                notes: null,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount
                }))
            };

            // Criar a venda
            const createdSale = await createSale(saleData);

            // Mostrar modal de confirmação
            setCompletedSale(createdSale);
            setShowConfirmationModal(true);

            // Limpar carrinho
            clearCart();
            setSelectedCustomer(null);

        } catch (error) {
            console.error('Erro ao criar venda:', error);
            toast.error('Erro ao processar venda. Tente novamente.');
        }
    }, [selectedCustomer, cart, validateStock, createSale, clearCart]);

    // Handler para nova venda
    const handleNewSale = useCallback(() => {
        clearCart();
        setSelectedCustomer(null);
        setCompletedSale(null);
        setShowConfirmationModal(false);
    }, [clearCart]);

    // Handlers para impressão e envios
    const handlePrint = useCallback(async (type: 'receipt' | 'invoice') => {
        if (!completedSale) return;

        try {
            // Simular impressão
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (type === 'receipt') {
                toast.success('Cupom enviado para impressão');
            } else {
                toast.success('Nota fiscal enviada para impressão');
            }
        } catch (error) {
            toast.error('Erro ao imprimir documento');
        }
    }, [completedSale]);

    const handleSendEmail = useCallback(async (email: string) => {
        if (!completedSale) return;

        try {
            // Simular envio de email
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Comprovante enviado para ${email}`);
        } catch (error) {
            toast.error('Erro ao enviar email');
        }
    }, [completedSale]);

    const handleSendWhatsApp = useCallback(async (phone: string) => {
        if (!completedSale) return;

        try {
            // Simular envio do WhatsApp
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Comprovante enviado via WhatsApp para ${phone}`);
        } catch (error) {
            toast.error('Erro ao enviar WhatsApp');
        }
    }, [completedSale]);

    return (
        <>
            <ResponsivePOSLayout
                leftPanel={
                    <ProductSearchPanel
                        onAddToCart={handleAddToCart}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                    />
                }
                rightPanel={
                    <ShoppingCart
                        cart={cart}
                        selectedCustomer={selectedCustomer}
                        onUpdateItem={handleUpdateCartItem}
                        onRemoveItem={handleRemoveFromCart}
                        onCustomerSelect={handleCustomerSelect}
                        onCustomerClear={handleCustomerClear}
                        onDiscountApply={handleDiscountApply}
                        onTaxApply={handleTaxApply}
                        onConfirmSale={handleConfirmSale}
                        onClearCart={clearCart}
                        isLoading={creatingSale}
                    />
                }
            />

            {/* Modal de Confirmação */}
            {completedSale && (
                <SaleConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={() => setShowConfirmationModal(false)}
                    sale={completedSale}
                    onNewSale={handleNewSale}
                    onPrint={handlePrint}
                    onSendEmail={handleSendEmail}
                    onSendWhatsApp={handleSendWhatsApp}
                />
            )}
        </>
    );
}