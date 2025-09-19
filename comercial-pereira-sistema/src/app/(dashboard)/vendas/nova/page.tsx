// app/(dashboard)/vendas/nova/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SaleForm } from '@/components/sales/SaleForm';
import { useCreateSale } from '@/lib/hooks/useSales';
import type { CreateSaleRequest } from '@/types/sale';

export default function NovaVendaPage() {
    const router = useRouter();
    const { createSale, loading } = useCreateSale();

    const handleSubmit = async (data: CreateSaleRequest) => {
        try {
            const newSale = await createSale(data);

            toast.success('Venda criada com sucesso!', {
                description: `Venda #${newSale.id} foi criada e está pendente`,
                action: {
                    label: 'Ver Venda',
                    onClick: () => router.push(`/vendas/${newSale.id}`)
                }
            });

            router.push('/vendas');
        } catch (error) {
            console.error('Error creating sale:', error);
            toast.error('Erro ao criar venda', {
                description: 'Verifique os dados e tente novamente'
            });
        }
    };

    const handleCancel = () => {
        router.push('/vendas');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SaleForm
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={loading}
                />
            </div>
        </div>
    );
}