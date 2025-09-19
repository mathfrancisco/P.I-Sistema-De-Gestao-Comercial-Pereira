// components/sales/ShoppingCart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
    ShoppingCart as CartIcon,
    Minus,
    Plus,
    X,
    User,
    CreditCard,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import type {  DiscountType } from '@/types/sale';
import type { CustomerResponse } from '@/types/customer';

interface ShoppingCartProps {
    cart: ShoppingCart;
    selectedCustomer?: CustomerResponse | null;
    onUpdateItem: (productId: number, updates: { quantity?: number; discount?: number }) => void;
    onRemoveItem: (productId: number) => void;
    onCustomerSelect: (customer: CustomerResponse) => void;
    onCustomerClear: () => void;
    onDiscountApply: (type: DiscountType, value: number) => void;
    onTaxApply: (value: number) => void;
    onConfirmSale: () => void;
    onClearCart: () => void;
    isLoading?: boolean;
    className?: string;
}

interface CartItemProps {
    item: ShoppingCart['items'][0];
    onUpdateQuantity: (quantity: number) => void;
    onUpdateDiscount: (discount: number) => void;
    onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
                                               item,
                                               onUpdateQuantity,
                                               onUpdateDiscount,
                                               onRemove
                                           }) => {
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
    const [tempDiscount, setTempDiscount] = useState(item.discount.toString());

    const handleQuantitySubmit = () => {
        const newQuantity = Math.max(1, Math.min(item.availableStock, parseInt(tempQuantity) || 1));
        onUpdateQuantity(newQuantity);
        setTempQuantity(newQuantity.toString());
        setIsEditingQuantity(false);
    };

    const handleDiscountSubmit = () => {
        const newDiscount = Math.max(0, Math.min(item.total, parseFloat(tempDiscount) || 0));
        onUpdateDiscount(newDiscount);
        setTempDiscount(newDiscount.toString());
        setIsEditingDiscount(false);
    };

    const exceedsStock = item.quantity > item.availableStock;

    return (
        <div className={cn(
            'border-b border-gray-100 py-3 px-1 transition-colors',
            exceedsStock && 'bg-red-50 border-red-200'
        )}>
            <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <CartIcon className="w-5 h-5 text-gray-400" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                        {item.productName}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                        {item.productCode}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center border border-gray-200 rounded">
                            <button
                                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                                className="p-1 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="w-3 h-3" />
                            </button>

                            {isEditingQuantity ? (
                                <input
                                    type="number"
                                    value={tempQuantity}
                                    onChange={(e) => setTempQuantity(e.target.value)}
                                    onBlur={handleQuantitySubmit}
                                    onKeyPress={(e) => e.key === 'Enter' && handleQuantitySubmit()}
                                    className="w-12 text-center text-sm border-none focus:outline-none"
                                    min="1"
                                    max={item.availableStock}
                                    autoFocus
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsEditingQuantity(true);
                                        setTempQuantity(item.quantity.toString());
                                    }}
                                    className="w-12 text-center text-sm hover:bg-gray-50 py-1"
                                >
                                    {item.quantity}
                                </button>
                            )}

                            <button
                                onClick={() => onUpdateQuantity(Math.min(item.availableStock, item.quantity + 1))}
                                className="p-1 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity >= item.availableStock}
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        <span className="text-xs text-gray-500">
              / {item.availableStock} disp.
            </span>

                        {exceedsStock && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                Estoque insuficiente
                            </div>
                        )}
                    </div>

                    {/* Price and Discount */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                R$ {item.unitPrice.toFixed(2)} × {item.quantity}
              </span>
                            <span className="font-medium">
                R$ {(item.unitPrice * item.quantity).toFixed(2)}
              </span>
                        </div>

                        {/* Discount Input */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Desconto:</span>
                            {isEditingDiscount ? (
                                <input
                                    type="number"
                                    value={tempDiscount}
                                    onChange={(e) => setTempDiscount(e.target.value)}
                                    onBlur={handleDiscountSubmit}
                                    onKeyPress={(e) => e.key === 'Enter' && handleDiscountSubmit()}
                                    className="w-16 text-xs border border-gray-200 rounded px-2 py-1"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max={item.total}
                                    autoFocus
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsEditingDiscount(true);
                                        setTempDiscount(item.discount.toString());
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    R$ {item.discount.toFixed(2)}
                                </button>
                            )}
                        </div>

                        {/* Item Total */}
                        <div className="flex items-center justify-between font-medium text-green-600">
                            <span className="text-xs">Total:</span>
                            <span>R$ {item.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={onRemove}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const CartSummary: React.FC<{
    cart: ShoppingCart;
    onDiscountApply: (type: DiscountType, value: number) => void;
    onTaxApply: (value: number) => void;
}> = ({ cart, onDiscountApply, onTaxApply }) => {
    const [discountType, setDiscountType] = useState<DiscountType>('FIXED');
    const [discountValue, setDiscountValue] = useState('');
    const [taxValue, setTaxValue] = useState('');

    const handleDiscountApply = () => {
        const value = parseFloat(discountValue) || 0;
        if (value > 0) {
            onDiscountApply(discountType, value);
            setDiscountValue('');
        }
    };

    const handleTaxApply = () => {
        const value = parseFloat(taxValue) || 0;
        if (value >= 0) {
            onTaxApply(value);
            setTaxValue('');
        }
    };

    return (
        <div className="bg-gray-50 p-4 space-y-3">
            {/* Discount Controls */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-800">Desconto</h4>
                <div className="flex gap-2">
                    <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                        <option value="FIXED">R$</option>
                        <option value="PERCENTAGE">%</option>
                    </select>
                    <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === 'PERCENTAGE' ? '10' : '50.00'}
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
                        step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
                        min="0"
                        max={discountType === 'PERCENTAGE' ? '100' : cart.totals.subtotal}
                    />
                    <Button
                        size="sm"
                        onClick={handleDiscountApply}
                        disabled={!discountValue}
                        className="text-xs px-3"
                    >
                        Aplicar
                    </Button>
                </div>
            </div>

            {/* Tax Controls */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-800">Taxa/Frete</h4>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={taxValue}
                        onChange={(e) => setTaxValue(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
                        step="0.01"
                        min="0"
                    />
                    <Button
                        size="sm"
                        onClick={handleTaxApply}
                        className="text-xs px-3"
                    >
                        Aplicar
                    </Button>
                </div>
            </div>

            {/* Summary Totals */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>R$ {cart.totals.subtotal.toFixed(2)}</span>
                </div>

                {cart.totals.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                        <span>Desconto:</span>
                        <span>- R$ {cart.totals.discount.toFixed(2)}</span>
                    </div>
                )}

                {cart.totals.tax > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                        <span>Taxa/Frete:</span>
                        <span>+ R$ {cart.totals.tax.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {cart.totals.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
                                                              cart,
                                                              selectedCustomer,
                                                              onUpdateItem,
                                                              onRemoveItem,
                                                              onCustomerSelect,
                                                              onCustomerClear,
                                                              onDiscountApply,
                                                              onTaxApply,
                                                              onConfirmSale,
                                                              onClearCart,
                                                              isLoading = false,
                                                              className
                                                          }) => {
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [showPayment, setShowPayment] = useState(false);

    const hasItems = cart.items.length > 0;
    const hasValidationErrors = cart.validationErrors.length > 0;
    const canProceedToPayment = hasItems && selectedCustomer && !hasValidationErrors;

    const itemsCount = useMemo(() => {
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }, [cart.items]);

    return (
        <div className={cn('flex flex-col h-full bg-white', className)}>
            {/* Customer Selection */}
            <div className="p-4 border-b border-gray-200">
                <CustomerQuickSelect
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={onCustomerSelect}
                    onCustomerClear={onCustomerClear}
                />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
                {hasItems ? (
                    <div className="px-4">
                        <div className="sticky top-0 bg-white py-2 border-b border-gray-100 mb-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                    Itens ({itemsCount})
                                </h3>
                                <button
                                    onClick={onClearCart}
                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                >
                                    Limpar carrinho
                                </button>
                            </div>
                        </div>

                        {cart.items.map((item) => (
                            <CartItem
                                key={item.productId}
                                item={item}
                                onUpdateQuantity={(quantity) =>
                                    onUpdateItem(item.productId, { quantity })
                                }
                                onUpdateDiscount={(discount) =>
                                    onUpdateItem(item.productId, { discount })
                                }
                                onRemove={() => onRemoveItem(item.productId)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <CartIcon className="w-16 h-16 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
                        <p className="text-sm text-center">
                            Adicione produtos para começar uma venda
                        </p>
                    </div>
                )}
            </div>

            {/* Validation Errors */}
            {hasValidationErrors && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                    <div className="space-y-1">
                        {cart.validationErrors.map((error, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-red-700">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cart Summary and Actions */}
            {hasItems && (
                <>
                    <CartSummary
                        cart={cart}
                        onDiscountApply={onDiscountApply}
                        onTaxApply={onTaxApply}
                    />

                    {/* Payment Method Selection */}
                    {showPayment && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodSelect={setPaymentMethod}
                                totalAmount={cart.totals.total}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        {!showPayment ? (
                            <Button
                                onClick={() => setShowPayment(true)}
                                disabled={!canProceedToPayment || isLoading}
                                className="w-full h-12 text-base font-medium"
                                size="lg"
                            >
                                {!selectedCustomer ? (
                                    <>
                                        <User className="w-5 h-5 mr-2" />
                                        Selecionar Cliente
                                    </>
                                ) : hasValidationErrors ? (
                                    <>
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        Corrigir Erros
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Forma de Pagamento
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    onClick={() => setShowPayment(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Voltar ao Carrinho
                                </Button>

                                <Button
                                    onClick={onConfirmSale}
                                    disabled={!paymentMethod || isLoading}
                                    className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Finalizar Venda - R$ {cart.totals.total.toFixed(2)}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};