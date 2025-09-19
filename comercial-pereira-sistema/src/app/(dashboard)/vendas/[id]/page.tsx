// app/(dashboard)/vendas/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit2,
    Printer,
    Mail,
    MessageCircle,
    CheckCircle2,
    X,
    RefreshCw,
    User,
    Building,
    MapPin,
    Phone,
    Calendar,
    Hash,
    Package,
    FileText,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { toast } from 'sonner';
import { useSale, useSaleActions } from '@/lib/hooks/useSales';
import {
    formatSaleNumber,
    getSaleStatusLabel,
    getSaleStatusColor,
    isSaleEditable,
    isSaleCancellable,
    SaleStatus
} from '@/types/sale';
import type { SaleResponse } from '@/types/sale';

interface SaleStatusBadgeProps {
    status: SaleStatus;
    className?: string;
}

const SaleStatusBadge: React.FC<SaleStatusBadgeProps> = ({ status, className }) => {
    const color = getSaleStatusColor(status);
    const label = getSaleStatusLabel(status);

    const colorClasses = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200'
    };

    return (
        <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
            colorClasses[color as keyof typeof colorClasses],
            className
        )}>
      {label}
    </span>
    );
};

interface SaleHeaderProps {
    sale: SaleResponse;
    onEdit: () => void;
    onCancel: () => void;
    onComplete: () => void;
    onPrint: () => void;
    onSendEmail: () => void;
    onSendWhatsApp: () => void;
    isLoading: boolean;
}

const SaleHeader: React.FC<SaleHeaderProps> = ({
                                                   sale,
                                                   onEdit,
                                                   onCancel,
                                                   onComplete,
                                                   onPrint,
                                                   onSendEmail,
                                                   onSendWhatsApp,
                                                   isLoading
                                               }) => {
    const router = useRouter();

    const canEdit = isSaleEditable(sale.status);
    const canCancel = isSaleCancellable(sale.status);
    const canComplete = sale.status === 'CONFIRMED';

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Venda {formatSaleNumber(sale.id)}
                            </h1>
                            <SaleStatusBadge status={sale.status} />
                        </div>
                        <p className="text-gray-600 mt-1">
                            Criada em {new Date(sale.createdAt).toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    <Button
                        variant="outline"
                        onClick={onPrint}
                        disabled={isLoading}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onSendEmail}
                        disabled={isLoading || !sale.customer.email}
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onSendWhatsApp}
                        disabled={isLoading || !sale.customer.phone}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                    </Button>

                    {/* Primary Actions */}
                    {canEdit && (
                        <Button onClick={onEdit} disabled={isLoading}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    )}

                    {canComplete && (
                        <Button
                            onClick={onComplete}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Finalizar
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            onClick={onCancel}
                            disabled={isLoading}
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface CustomerInfoCardProps {
    customer: SaleResponse['customer'];
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ customer }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Cliente
            </h2>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white',
                        customer.type === 'WHOLESALE' ? 'bg-blue-500' : 'bg-green-500'
                    )}>
                        {customer.type === 'WHOLESALE' ? (
                            <Building className="w-5 h-5" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                            <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                customer.type === 'WHOLESALE'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                            )}>
                {customer.type === 'WHOLESALE' ? 'Atacado' : 'Varejo'}
              </span>
                        </div>

                        {customer.document && (
                            <p className="text-sm text-gray-600 mt-1">
                                {customer.document}
                            </p>
                        )}
                    </div>
                </div>

                {customer.address && (
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-600">
                            <p>{customer.address.street}</p>
                            <p>{customer.address.city}, {customer.address.state}</p>
                            <p>{customer.address.zipCode}</p>
                        </div>
                    </div>
                )}

                {customer.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{customer.phone}</span>
                    </div>
                )}

                {customer.email && (
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{customer.email}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface SaleInfoCardProps {
    sale: SaleResponse;
}

const SaleInfoCard: React.FC<SaleInfoCardProps> = ({ sale }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações da Venda
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-600">Número</p>
                        <p className="font-medium">{formatSaleNumber(sale.id)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-600">Data da Venda</p>
                        <p className="font-medium">
                            {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-600">Vendedor</p>
                        <p className="font-medium">{sale.user.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-600">Total de Itens</p>
                        <p className="font-medium">{sale._count?.items || 0}</p>
                    </div>
                </div>
            </div>

            {sale.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Observações</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{sale.notes}</p>
                </div>
            )}
        </div>
    );
};

interface SaleItemsTableProps {
    items: SaleResponse['items'];
}

const SaleItemsTable: React.FC<SaleItemsTableProps> = ({ items }) => {
    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Itens da Venda
                </h2>
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum item encontrado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Itens da Venda ({items.length})
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço Unit.
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Desconto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.product.code} • {item.product.category.name}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                R$ {item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                                {item.discount > 0 ? `R$ ${item.discount.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                R$ {item.total.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface SaleTotalsCardProps {
    sale: SaleResponse;
}

const SaleTotalsCard: React.FC<SaleTotalsCardProps> = ({ sale }) => {
    const subtotal = sale.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
    const itemDiscounts = sale.items?.reduce((sum, item) => sum + item.discount, 0) || 0;
    const totalDiscounts = itemDiscounts + (sale.discount || 0);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo Financeiro
            </h2>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>

                {totalDiscounts > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Desconto:</span>
                        <span className="font-medium text-red-600">- R$ {totalDiscounts.toFixed(2)}</span>
                    </div>
                )}

                {sale.tax && sale.tax > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxa/Frete:</span>
                        <span className="font-medium text-blue-600">+ R$ {sale.tax.toFixed(2)}</span>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
              R$ {sale.total.toFixed(2)}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SaleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const saleId = parseInt(params.id as string);

    const { sale, loading, error, refresh } = useSale(saleId);
    const { completeSale, cancelSale, loading: actionLoading } = useSaleActions();

    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleEdit = () => {
        router.push(`/vendas/${saleId}/edit`);
    };

    const handleComplete = async () => {
        if (!sale) return;

        try {
            setIsProcessing('complete');
            await completeSale(sale.id);
            await refresh();
            toast.success('Venda finalizada com sucesso!');
        } catch (error) {
            console.error('Error completing sale:', error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleCancel = async () => {
        if (!sale) return;

        if (!confirm(`Tem certeza que deseja cancelar a venda ${formatSaleNumber(sale.id)}?`)) {
            return;
        }

        try {
            setIsProcessing('cancel');
            await cancelSale(sale.id);
            await refresh();
            toast.success('Venda cancelada com sucesso!');
        } catch (error) {
            console.error('Error canceling sale:', error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handlePrint = async () => {
        setIsProcessing('print');
        try {
            // Simulate printing
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Documento enviado para impressão');
        } finally {
            setIsProcessing(null);
        }
    };

    const handleSendEmail = async () => {
        if (!sale?.customer.email) return;

        setIsProcessing('email');
        try {
            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Comprovante enviado para ${sale.customer.email}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!sale?.customer.phone) return;

        setIsProcessing('whatsapp');
        try {
            // Simulate WhatsApp sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Comprovante enviado via WhatsApp para ${sale.customer.phone}`);
        } finally {
            setIsProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando detalhes da venda...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Erro ao carregar venda
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={refresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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

    const isLoading = actionLoading || !!isProcessing;

    return (
        <div className="min-h-screen bg-gray-50">
            <SaleHeader
                sale={sale}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onComplete={handleComplete}
                onPrint={handlePrint}
                onSendEmail={handleSendEmail}
                onSendWhatsApp={handleSendWhatsApp}
                isLoading={isLoading}
            />

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <SaleItemsTable items={sale.items} />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <SaleTotalsCard sale={sale} />
                        <CustomerInfoCard customer={sale.customer} />
                        <SaleInfoCard sale={sale} />
                    </div>
                </div>
            </div>
        </div>
    );
}