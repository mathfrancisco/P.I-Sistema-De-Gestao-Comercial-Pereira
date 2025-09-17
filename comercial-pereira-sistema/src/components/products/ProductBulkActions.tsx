// components/products/ProductBulkActions.tsx
import React from 'react';
import { Download, Tag, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductBulkActionsProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkDelete: () => void;
    onBulkExport: () => void;
    onBulkChangeCategory: () => void;
    onBulkUpdatePrice: () => void;
    loading?: boolean;
}

export const ProductBulkActions: React.FC<ProductBulkActionsProps> = ({
                                                                          selectedCount,
                                                                          onClearSelection,
                                                                          onBulkDelete,
                                                                          onBulkExport,
                                                                          onBulkChangeCategory,
                                                                          onBulkUpdatePrice,
                                                                          loading = false
                                                                      }) => {
    // Barra que aparece quando items são selecionados
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 min-w-96">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        {/* Contador de items selecionados à esquerda */}
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">{selectedCount}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
              {selectedCount} produtos selecionados
            </span>
                    </div>

                    {/* Clear selection link para desmarcar todos */}
                    <button
                        onClick={onClearSelection}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                        disabled={loading}
                    >
                        Clear selection
                    </button>
                </div>

                {/* Botões de ação: Delete, Export, Change Category, Update Price */}
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={Download}
                        onClick={onBulkExport}
                        disabled={loading}
                    >
                        Export
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={Tag}
                        onClick={onBulkChangeCategory}
                        disabled={loading}
                    >
                        Change Category
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={DollarSign}
                        onClick={onBulkUpdatePrice}
                        disabled={loading}
                    >
                        Update Price
                    </Button>

                    {/* Confirmação modal para ações destrutivas */}
                    <Button
                        size="sm"
                        variant="danger"
                        leftIcon={Trash2}
                        onClick={onBulkDelete}
                        disabled={loading}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};