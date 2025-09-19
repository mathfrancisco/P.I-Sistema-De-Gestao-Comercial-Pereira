'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaleForm } from '@/components/sales/SaleForm';
import { useSale, useUpdateSale } from '@/lib/hooks/useSales';
import { isSaleEditable } from '@/types/sale';
import type { UpdateSaleRequest } from '@/types/sale';

export default function EditarVendaPage() {
    const params = useParams();
    const router = useRouter();
    const saleId = parseInt(params.id as string);

    const { sale, loading: loadingSale, error, refresh } = useSale(saleId);
    const { updateSale, loading: updatingSale } = useUpdateSale();

    const handleSubmit = async (data: UpdateSaleRequest) => {
        if (!sale) return;

        try {
            const updatedSale = await updateSale(sale.id, data);

            toast.success('Venda atualizada com sucesso!', {
                description: `Venda #${updatedSale.id} foi atualizada`,
                action: {
                    label: 'Ver Venda',
                    onClick: () => router.push(`/vendas/${updatedSale.id}`)
                }
            });

            router.push(`/vendas/${sale.id}`);
        } catch (error) {
            console.error('Error updating sale:', error);
            toast.error('Erro ao atualizar venda', {
                description: 'Verifique os dados e tente novamente'
            });
        }
    };

    const handleCancel = () => {
        router.push(`/vendas/${saleId}`);
    };

    // Loading state
    if (loadingSale) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dados da venda...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Erro ao carregar venda
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button onClick={refresh}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tentar novamente
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/vendas')}>
                            Voltar para vendas
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Sale not found
    if (!sale) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Venda não encontrada
                    </h2>
                    <p className="text-gray-600 mb-4">
                        A venda solicitada não existe ou foi removida
                    </p>
                    <Button onClick={() => router.push('/vendas')}>
                        Voltar para vendas
                    </Button>
                </div>
            </div>
        );
    }

    // Check if sale is editable
    if (!isSaleEditable(sale.status)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Venda não pode ser editada
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Apenas vendas com status "Rascunho" ou "Pendente" podem ser editadas
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button onClick={() => router.push(`/vendas/${saleId}`)}>
                            Ver Detalhes da Venda
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/vendas')}>
                            Voltar para vendas
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SaleForm
                    mode="edit"
                    initialData={sale}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updatingSale}
                />
            </div>
        </div>
    );
}