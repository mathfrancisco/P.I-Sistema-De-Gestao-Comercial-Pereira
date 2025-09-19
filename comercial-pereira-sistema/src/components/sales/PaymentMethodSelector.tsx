// components/sales/PaymentMethodSelector.tsx
'use client';

import React, { useState } from 'react';
import {
    Banknote,
    CreditCard,
    Smartphone,
    FileText,
    Clock,
    DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PaymentMethod {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    description?: string;
    requiresDetails?: boolean;
}

interface PaymentMethodSelectorProps {
    selectedMethod: string;
    onMethodSelect: (methodId: string, details?: PaymentDetails) => void;
    totalAmount: number;
    className?: string;
}

interface PaymentDetails {
    amount?: number;
    change?: number;
    installments?: number;
    cardNumber?: string;
    cardHolder?: string;
    pixKey?: string;
    bankSlipDueDate?: Date;
    notes?: string;
}

const paymentMethods: PaymentMethod[] = [
    {
        id: 'cash',
        name: 'Dinheiro',
        icon: Banknote,
        color: 'text-green-600',
        bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
        description: 'Pagamento à vista em espécie',
        requiresDetails: true
    },
    {
        id: 'credit_card',
        name: 'Cartão de Crédito',
        icon: CreditCard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        description: 'Parcelado ou à vista',
        requiresDetails: true
    },
    {
        id: 'debit_card',
        name: 'Cartão de Débito',
        icon: CreditCard,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
        description: 'Débito automático'
    },
    {
        id: 'pix',
        name: 'PIX',
        icon: Smartphone,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
        description: 'Transferência instantânea'
    },
    {
        id: 'bank_slip',
        name: 'Boleto',
        icon: FileText,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
        description: 'Vencimento personalizado',
        requiresDetails: true
    },
    {
        id: 'store_credit',
        name: 'Crediário',
        icon: Clock,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
        description: 'Parcelamento próprio',
        requiresDetails: true
    }
];

const CashPaymentForm: React.FC<{
    totalAmount: number;
    onConfirm: (details: PaymentDetails) => void;
    onCancel: () => void;
}> = ({ totalAmount, onConfirm, onCancel }) => {
    const [paidAmount, setPaidAmount] = useState(totalAmount.toString());

    const paidValue = parseFloat(paidAmount) || 0;
    const change = Math.max(0, paidValue - totalAmount);
    const isValid = paidValue >= totalAmount;

    const handleConfirm = () => {
        if (isValid) {
            onConfirm({
                amount: paidValue,
                change: change
            });
        }
    };

    return (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium">
                <Banknote className="w-5 h-5" />
                <span>Pagamento em Dinheiro</span>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor total da venda
                    </label>
                    <div className="text-lg font-bold text-green-600">
                        R$ {totalAmount.toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor pago pelo cliente
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="number"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder="0.00"
                            className="pl-10"
                            step="0.01"
                            min={totalAmount}
                        />
                    </div>
                </div>

                {change > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800">
                Troco a devolver:
              </span>
                            <span className="text-lg font-bold text-yellow-600">
                R$ {change.toFixed(2)}
              </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={!isValid}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
};

const CreditCardPaymentForm: React.FC<{
    totalAmount: number;
    onConfirm: (details: PaymentDetails) => void;
    onCancel: () => void;
}> = ({ totalAmount, onConfirm, onCancel }) => {
    const [installments, setInstallments] = useState('1');
    const [cardHolder, setCardHolder] = useState('');

    const installmentValue = totalAmount / parseInt(installments);

    const handleConfirm = () => {
        onConfirm({
            amount: totalAmount,
            installments: parseInt(installments),
            cardHolder: cardHolder.trim() || undefined
        });
    };

    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
                <CreditCard className="w-5 h-5" />
                <span>Pagamento no Cartão de Crédito</span>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor total
                    </label>
                    <div className="text-lg font-bold text-blue-600">
                        R$ {totalAmount.toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de parcelas
                    </label>
                    <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                                {num}x de R$ {installmentValue.toFixed(2)}
                                {num === 1 ? ' (à vista)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome no cartão (opcional)
                    </label>
                    <Input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Nome como está no cartão"
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
};

const BankSlipPaymentForm: React.FC<{
    totalAmount: number;
    onConfirm: (details: PaymentDetails) => void;
    onCancel: () => void;
}> = ({ totalAmount, onConfirm, onCancel }) => {
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Default to 7 days from now
        return date.toISOString().split('T')[0];
    });

    const handleConfirm = () => {
        onConfirm({
            amount: totalAmount,
            bankSlipDueDate: new Date(dueDate)
        });
    };

    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="w-5 h-5" />
                <span>Pagamento por Boleto</span>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor total
                    </label>
                    <div className="text-lg font-bold text-gray-600">
                        R$ {totalAmount.toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de vencimento
                    </label>
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
};

const StoreCreditPaymentForm: React.FC<{
    totalAmount: number;
    onConfirm: (details: PaymentDetails) => void;
    onCancel: () => void;
}> = ({ totalAmount, onConfirm, onCancel }) => {
    const [installments, setInstallments] = useState('3');

    const installmentValue = totalAmount / parseInt(installments);

    const handleConfirm = () => {
        onConfirm({
            amount: totalAmount,
            installments: parseInt(installments)
        });
    };

    return (
        <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 text-indigo-700 font-medium">
                <Clock className="w-5 h-5" />
                <span>Crediário da Loja</span>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor total
                    </label>
                    <div className="text-lg font-bold text-indigo-600">
                        R$ {totalAmount.toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcelamento
                    </label>
                    <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        {[3, 6, 9, 12, 15, 18].map(num => (
                            <option key={num} value={num}>
                                {num}x de R$ {installmentValue.toFixed(2)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                        * Sujeito à análise de crédito e aprovação
                    </p>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
};

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
                                                                                selectedMethod,
                                                                                onMethodSelect,
                                                                                totalAmount,
                                                                                className
                                                                            }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedMethodData, setSelectedMethodData] = useState<PaymentMethod | null>(null);

    const handleMethodClick = (method: PaymentMethod) => {
        setSelectedMethodData(method);

        if (method.requiresDetails) {
            setShowDetails(true);
        } else {
            onMethodSelect(method.id);
            setShowDetails(false);
        }
    };

    const handleDetailsConfirm = (details: PaymentDetails) => {
        if (selectedMethodData) {
            onMethodSelect(selectedMethodData.id, details);
            setShowDetails(false);
        }
    };

    const handleDetailsCancel = () => {
        setShowDetails(false);
        setSelectedMethodData(null);
    };

    const selectedMethodObj = paymentMethods.find(m => m.id === selectedMethod);

    if (showDetails && selectedMethodData) {
        return (
            <div className={className}>
                {selectedMethodData.id === 'cash' && (
                    <CashPaymentForm
                        totalAmount={totalAmount}
                        onConfirm={handleDetailsConfirm}
                        onCancel={handleDetailsCancel}
                    />
                )}
                {selectedMethodData.id === 'credit_card' && (
                    <CreditCardPaymentForm
                        totalAmount={totalAmount}
                        onConfirm={handleDetailsConfirm}
                        onCancel={handleDetailsCancel}
                    />
                )}
                {selectedMethodData.id === 'bank_slip' && (
                    <BankSlipPaymentForm
                        totalAmount={totalAmount}
                        onConfirm={handleDetailsConfirm}
                        onCancel={handleDetailsCancel}
                    />
                )}
                {selectedMethodData.id === 'store_credit' && (
                    <StoreCreditPaymentForm
                        totalAmount={totalAmount}
                        onConfirm={handleDetailsConfirm}
                        onCancel={handleDetailsCancel}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Forma de Pagamento</h3>

                <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethod === method.id;

                        return (
                            <button
                                key={method.id}
                                onClick={() => handleMethodClick(method)}
                                className={cn(
                                    'p-4 border-2 rounded-lg transition-all duration-200 text-left',
                                    isSelected
                                        ? `${method.bgColor} border-current ${method.color} ring-2 ring-offset-2 ring-current`
                                        : `${method.bgColor} border-transparent hover:border-gray-300`
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn('w-6 h-6', method.color)} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            'font-medium text-sm',
                                            isSelected ? method.color : 'text-gray-900'
                                        )}>
                                            {method.name}
                                        </h4>
                                        {method.description && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {method.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {selectedMethodObj && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                            <selectedMethodObj.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                {selectedMethodObj.name} selecionado
              </span>
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                            Valor: R$ {totalAmount.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};