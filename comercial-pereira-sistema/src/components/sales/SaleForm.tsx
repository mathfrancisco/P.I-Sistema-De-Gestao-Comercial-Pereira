// components/sales/SaleForm.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    X,
    Save,
    Package,
    Calculator,
    AlertCircle,
    Search,
    ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerQuickSelect } from './CustomerQuickSelect';
import { useProductsForSelect } from '@/lib/hooks/useProducts';
import { useValidateStock } from '@/lib/hooks/useSales';
import {
    createSaleSchema,
    updateSaleSchema,
} from '@/lib/validations/sale';
import {
    calculateItemTotal,
    calculateSaleSubtotal,
    calculateSaleTotal,
    SALE_CONSTRAINTS
} from '@/types/sale';
import type {
    CreateSaleRequest,
    UpdateSaleRequest,
    SaleResponse,
    SaleFormData,
    SaleFormErrors
} from '@/types/sale';
import type { CustomerResponse} from '@/types/customer';
import {ProductResponse} from "@/types";

interface SaleFormProps {
    mode: 'create' | 'edit';
    initialData?: SaleResponse;
    onSubmit: (data: CreateSaleRequest | UpdateSaleRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    className?: string;
}

interface SaleItemFormData {
    productId: number;
    productName?: string;
    productCode?: string;
    productPrice?: number;
    availableStock?: number;
    quantity: number;
    unitPrice: number;
    discount: number;
}

interface ProductSearchProps {
    onProductSelect: (product: ProductResponse) => void;
    excludeIds?: number[];
}

const ProductSearch: React.FC<ProductSearchProps> = ({
                                                         onProductSelect,
                                                         excludeIds = []
                                                     }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { data: products, isLoading } = useProductsForSelect();

    const filteredProducts = useMemo(() => {
        if (!products || !searchTerm) return [];

        return products
            .filter(product =>
                !excludeIds.includes(product.id) &&
                (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.code.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .slice(0, 10); // Limit to 10 results
    }, [products, searchTerm, excludeIds]);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-10"
                />
            </div>

            {isOpen && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Buscando produtos...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Nenhum produto encontrado
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    onProductSelect(product);
                                    setSearchTerm('');
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                                        <p className="text-sm text-gray-500">{product.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">
                                            R$ {product.price.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Est: {product.stock}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

interface SaleItemRowProps {
    item: SaleItemFormData;
    index: number;
    errors?: any;
    onChange: (index: number, field: keyof SaleItemFormData, value: any) => void;
    onRemove: (index: number) => void;
    stockValidation?: { valid: boolean; error?: string };
}

const SaleItemRow: React.FC<SaleItemRowProps> = ({
                                                     item,
                                                     index,
                                                     errors,
                                                     onChange,
                                                     onRemove,
                                                     stockValidation
                                                 }) => {
    const itemTotal = calculateItemTotal(item.quantity, item.unitPrice, item.discount);
    const hasStockError = stockValidation && !stockValidation.valid;

    return (
        <div className={cn(
            'grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border',
            hasStockError && 'border-red-300 bg-red-50'
        )}>
            {/* Product Info */}
            <div className="col-span-4">
                <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-gray-900 text-sm">
                        {item.productName || `Produto ${item.productId}`}
                    </h4>
                </div>
                {item.productCode && (
                    <p className="text-xs text-gray-500 mb-1">{item.productCode}</p>
                )}
                {item.availableStock !== undefined && (
                    <p className="text-xs text-gray-600">
                        Estoque: {item.availableStock}
                    </p>
                )}
                {hasStockError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stockValidation.error}
                    </p>
                )}
            </div>

            {/* Quantity */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantidade
                </label>
                <Input
                    type="number"
                    min="1"
                    max={item.availableStock}
                    value={item.quantity}
                    onChange={(e) => onChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className={cn(
                        'text-sm',
                        errors?.quantity && 'border-red-300',
                        hasStockError && 'border-red-300'
                    )}
                />
                {errors?.quantity && (
                    <p className="text-xs text-red-600 mt-1">{errors.quantity.message}</p>
                )}
            </div>

            {/* Unit Price */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Preço Unit.
                </label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.unitPrice}
                    onChange={(e) => onChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className={cn('text-sm', errors?.unitPrice && 'border-red-300')}
                />
                {errors?.unitPrice && (
                    <p className="text-xs text-red-600 mt-1">{errors.unitPrice.message}</p>
                )}
            </div>

            {/* Discount */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Desconto
                </label>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={item.quantity * item.unitPrice}
                    value={item.discount}
                    onChange={(e) => onChange(index, 'discount', parseFloat(e.target.value) || 0)}
                    className={cn('text-sm', errors?.discount && 'border-red-300')}
                />
                {errors?.discount && (
                    <p className="text-xs text-red-600 mt-1">{errors.discount.message}</p>
                )}
            </div>

            {/* Total */}
            <div className="col-span-1 flex flex-col justify-between">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total
                </label>
                <div className="text-sm font-bold text-green-600 py-2">
                    R$ {itemTotal.toFixed(2)}
                </div>
            </div>

            {/* Remove Button */}
            <div className="col-span-1 flex items-end justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export const SaleForm: React.FC<SaleFormProps> = ({
                                                      mode,
                                                      initialData,
                                                      onSubmit,
                                                      onCancel,
                                                      isLoading = false,
                                                      className
                                                  }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(
        initialData?.customer || null
    );
    const [stockValidations, setStockValidations] = useState<Record<number, { valid: boolean; error?: string }>>({});
    const { validateStock } = useValidateStock();

    const schema = mode === 'create' ? createSaleSchema : updateSaleSchema;

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors, isValid }
    } = useForm<CreateSaleRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            customerId: initialData?.customerId || 0,
            notes: initialData?.notes || '',
            discount: initialData?.discount || 0,
            tax: initialData?.tax || 0,
            items: initialData?.items?.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount
            })) || []
        }
    });

    const { fields: itemFields, append, remove, update } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');
    const watchedDiscount = watch('discount');
    const watchedTax = watch('tax');

    // Calculate totals
    const subtotal = useMemo(() => {
        return calculateSaleSubtotal(watchedItems);
    }, [watchedItems]);

    const total = useMemo(() => {
        return calculateSaleTotal(subtotal, watchedDiscount, watchedTax);
    }, [subtotal, watchedDiscount, watchedTax]);

    // Set customer ID when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            setValue('customerId', selectedCustomer.id);
        }
    }, [selectedCustomer, setValue]);

    // Validate stock when items change
    useEffect(() => {
        const validateItemsStock = async () => {
            if (watchedItems.length === 0) {
                setStockValidations({});
                return;
            }

            try {
                const result = await validateStock({
                    items: watchedItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                });

                const validations: Record<number, { valid: boolean; error?: string }> = {};

                if (!result.valid) {
                    result.errors.forEach(error => {
                        validations[error.productId] = {
                            valid: false,
                            error: error.message
                        };
                    });
                }

                watchedItems.forEach(item => {
                    if (!validations[item.productId]) {
                        validations[item.productId] = { valid: true };
                    }
                });

                setStockValidations(validations);
            } catch (error) {
                console.error('Error validating stock:', error);
            }
        };

        const timer = setTimeout(validateItemsStock, 500);
        return () => clearTimeout(timer);
    }, [watchedItems, validateStock]);

    const handleProductSelect = (product: ProductResponse) => {
        const existingIndex = itemFields.findIndex(field =>
            getValues(`items.${itemFields.indexOf(field)}.productId`) === product.id
        );

        if (existingIndex >= 0) {
            // Update existing item quantity
            const currentItem = getValues(`items.${existingIndex}`);
            update(existingIndex, {
                ...currentItem,
                quantity: currentItem.quantity + 1
            });
        } else {
            // Add new item
            append({
                productId: product.id,
                quantity: 1,
                unitPrice: product.price,
                discount: 0
            });
        }
    };

    const handleItemChange = (index: number, field: keyof SaleItemFormData, value: any) => {
        const currentItem = getValues(`items.${index}`);
        update(index, {
            ...currentItem,
            [field]: value
        });
    };

    const handleFormSubmit = async (data: CreateSaleRequest) => {
        if (!selectedCustomer) {
            alert('Por favor, selecione um cliente');
            return;
        }

        // Check for stock validation errors
        const hasStockErrors = Object.values(stockValidations).some(v => !v.valid);
        if (hasStockErrors) {
            alert('Corrija os erros de estoque antes de continuar');
            return;
        }

        await onSubmit(data);
    };

    const excludedProductIds = useMemo(() => {
        return watchedItems.map(item => item.productId);
    }, [watchedItems]);

    return (
        <div className={cn('max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200', className)}>
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'create' ? 'Nova Venda' : 'Editar Venda'}
                </h2>
                <p className="text-gray-600 mt-1">
                    {mode === 'create'
                        ? 'Preencha os dados para criar uma nova venda'
                        : 'Altere os dados conforme necessário'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Cliente *
                    </label>
                    <CustomerQuickSelect
                        selectedCustomer={selectedCustomer}
                        onCustomerSelect={setSelectedCustomer}
                        onCustomerClear={() => setSelectedCustomer(null)}
                    />
                    {errors.customerId && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.customerId.message}
                        </p>
                    )}
                </div>

                {/* Add Products */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
                        <div className="text-sm text-gray-600">
                            {itemFields.length} {itemFields.length === 1 ? 'item' : 'itens'}
                        </div>
                    </div>

                    <ProductSearch
                        onProductSelect={handleProductSelect}
                        excludeIds={excludedProductIds}
                    />

                    {itemFields.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum produto adicionado</p>
                            <p className="text-sm text-gray-500">
                                Use a busca acima para adicionar produtos à venda
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {itemFields.map((field, index) => (
                                <SaleItemRow
                                    key={field.id}
                                    item={watchedItems[index]}
                                    index={index}
                                    errors={errors.items?.[index]}
                                    onChange={handleItemChange}
                                    onRemove={remove}
                                    stockValidation={stockValidations[watchedItems[index]?.productId]}
                                />
                            ))}
                        </div>
                    )}

                    {errors.items && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.items.message}
                        </p>
                    )}
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discount and Tax */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Ajustes</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Desconto (R$)
                            </label>
                            <div className="relative">
                                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={subtotal}
                                    placeholder="0.00"
                                    className="pl-10"
                                    {...register('discount', { valueAsNumber: true })}
                                />
                            </div>
                            {errors.discount && (
                                <p className="text-sm text-red-600 mt-1">{errors.discount.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Taxa/Frete (R$)
                            </label>
                            <div className="relative">
                                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-10"
                                    {...register('tax', { valueAsNumber: true })}
                                />
                            </div>
                            {errors.tax && (
                                <p className="text-sm text-red-600 mt-1">{errors.tax.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Sales Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Resumo</h3>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                            </div>

                            {watchedDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Desconto:</span>
                                    <span className="font-medium text-red-600">- R$ {watchedDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            {watchedTax > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxa/Frete:</span>
                                    <span className="font-medium text-blue-600">+ R$ {watchedTax.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                    R$ {total.toFixed(2)}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Observações
                    </label>
                    <textarea
                        rows={3}
                        maxLength={SALE_CONSTRAINTS.NOTES_MAX_LENGTH}
                        placeholder="Observações sobre a venda..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register('notes')}
                    />
                    {errors.notes && (
                        <p className="text-sm text-red-600">{errors.notes.message}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        disabled={isLoading || !isValid || !selectedCustomer || itemFields.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {mode === 'create' ? 'Criando...' : 'Salvando...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {mode === 'create' ? 'Criar Venda' : 'Salvar Alterações'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};