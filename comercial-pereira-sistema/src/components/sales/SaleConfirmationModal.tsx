// components/sales/SaleConfirmationModal.tsx
'use client';

import React, { useState } from 'react';
import {
    CheckCircle2,
    Printer,
    Mail,
    MessageCircle,
    Download,
    Copy,
    X,
    ShoppingBag,
    User,
    Calendar,
    Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { formatSaleNumber, getSaleStatusLabel } from '@/types/sale';
import type { SaleResponse, SaleReceipt } from '@/types/sale';

interface SaleConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: SaleResponse;
    receipt?: SaleReceipt;
    onNewSale: () => void;
    onPrint?: (type: 'receipt' | 'invoice') => void;
    onSendEmail?: (email: string) => void;
    onSendWhatsApp?: (phone: string) => void;
    className?: string;
}

interface ActionButtonProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    loading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
                                                       icon: Icon,
                                                       label,
                                                       onClick,
                                                       variant = 'secondary',
                                                       disabled = false,
                                                       loading = false
                                                   }) => {
    const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50',
        outline: 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(baseClasses, variantClasses[variant])}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
                <Icon className="w-4 h-4" />
            )}
            <span className="text-sm">{label}</span>
        </button>
    );
};

const SaleDetailCard: React.FC<{ sale: SaleResponse }> = ({ sale }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Detalhes da Venda</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {getSaleStatusLabel(sale.status)}
        </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Número:</span>
                    <span className="font-medium">{formatSaleNumber(sale.id)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
            {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Vendedor:</span>
                    <span className="font-medium">{sale.user.name}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{sale._count?.items || 0}</span>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total da Venda:</span>
                    <span className="text-2xl font-bold text-green-600">
            R$ {sale.total.toFixed(2)}
          </span>
                </div>
            </div>
        </div>
    );
};

const CustomerCard: React.FC<{ customer: SaleResponse['customer'] }> = ({ customer }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Cliente</h3>

            <div className="space-y-2">
                <div>
                    <span className="text-blue-700 font-medium">{customer.name}</span>
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
            {customer.type === 'WHOLESALE' ? 'Atacado' : 'Varejo'}
          </span>
                </div>

                {customer.document && (
                    <div className="text-sm text-blue-600">
                        {customer.document}
                    </div>
                )}
            </div>
        </div>
    );
};

const ItemsList: React.FC<{ items: SaleResponse['items'] }> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Itens da Venda</h3>

            <div className="max-h-48 overflow-y-auto space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                                {item.product.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {item.product.code} • {item.product.category.name}
                            </p>
                        </div>

                        <div className="text-right text-sm">
                            <div className="font-medium">
                                {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                            </div>
                            {item.discount > 0 && (
                                <div className="text-red-600">
                                    - R$ {item.discount.toFixed(2)}
                                </div>
                            )}
                            <div className="font-bold text-green-600">
                                R$ {item.total.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SaleConfirmationModal: React.FC<SaleConfirmationModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                sale,
                                                                                receipt,
                                                                                onNewSale,
                                                                                onPrint,
                                                                                onSendEmail,
                                                                                onSendWhatsApp,
                                                                                className
                                                                            }) => {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [whatsappSent, setWhatsappSent] = useState(false);

    const handlePrint = async (type: 'receipt' | 'invoice') => {
        if (!onPrint) return;

        setIsProcessing(type);
        try {
            await onPrint(type);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleSendEmail = async () => {
        if (!onSendEmail || !sale.customer.email) return;

        setIsProcessing('email');
        try {
            await onSendEmail(sale.customer.email);
            setEmailSent(true);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!onSendWhatsApp || !sale.customer.phone) return;

        setIsProcessing('whatsapp');
        try {
            await onSendWhatsApp(sale.customer.phone);
            setWhatsappSent(true);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleNewSaleAndClose = () => {
        onNewSale();
        onClose();
    };

    const copyToClipboard = () => {
        const saleInfo = `
Venda ${formatSaleNumber(sale.id)}
Cliente: ${sale.customer.name}
Data: ${new Date(sale.saleDate).toLocaleDateString('pt-BR')}
Total: R$ ${sale.total.toFixed(2)}
    `.trim();

        navigator.clipboard.writeText(saleInfo);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={cn(
                'bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
                className
            )}>
                {/* Header */}
                <div className="bg-green-600 text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white hover:bg-green-700 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Venda Realizada com Sucesso!</h2>
                            <p className="text-green-100 mt-1">
                                A venda foi processada e confirmada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Sale Details */}
                        <SaleDetailCard sale={sale} />

                        {/* Customer Info */}
                        <CustomerCard customer={sale.customer} />

                        {/* Items List */}
                        <ItemsList items={sale.items} />
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="space-y-4">
                        {/* Print Options */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">Opções de Impressão</h4>

                            <div className="flex gap-2 flex-wrap">
                                <ActionButton
                                    icon={Printer}
                                    label="Cupom Fiscal"
                                    onClick={() => handlePrint('receipt')}
                                    loading={isProcessing === 'receipt'}
                                    disabled={!!isProcessing}
                                />

                                <ActionButton
                                    icon={Printer}
                                    label="Nota Fiscal"
                                    onClick={() => handlePrint('invoice')}
                                    loading={isProcessing === 'invoice'}
                                    disabled={!!isProcessing}
                                />

                                <ActionButton
                                    icon={Copy}
                                    label="Copiar Dados"
                                    onClick={copyToClipboard}
                                />
                            </div>
                        </div>

                        {/* Digital Options */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">Envio Digital</h4>

                            <div className="flex gap-2 flex-wrap">
                                {sale.customer.email && (
                                    <ActionButton
                                        icon={Mail}
                                        label={emailSent ? "Email Enviado" : "Enviar por Email"}
                                        onClick={handleSendEmail}
                                        loading={isProcessing === 'email'}
                                        disabled={!!isProcessing || emailSent}
                                        variant={emailSent ? 'outline' : 'secondary'}
                                    />
                                )}

                                {sale.customer.phone && (
                                    <ActionButton
                                        icon={MessageCircle}
                                        label={whatsappSent ? "WhatsApp Enviado" : "Enviar WhatsApp"}
                                        onClick={handleSendWhatsApp}
                                        loading={isProcessing === 'whatsapp'}
                                        disabled={!!isProcessing || whatsappSent}
                                        variant={whatsappSent ? 'outline' : 'secondary'}
                                    />
                                )}

                                <ActionButton
                                    icon={Download}
                                    label="Download PDF"
                                    onClick={() => handlePrint('receipt')}
                                />
                            </div>
                        </div>

                        {/* Main Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button
                                onClick={handleNewSaleAndClose}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Nova Venda
                            </Button>

                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="px-8 h-12 text-base font-medium"
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};