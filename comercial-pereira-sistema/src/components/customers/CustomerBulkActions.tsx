// components/customers/CustomerBulkActions.tsx
import React, { useState } from 'react';
import {
    Download, Mail, UserX, UserCheck, Tag,
    AlertTriangle, X, Check, Loader2, Users
} from 'lucide-react';
import { CustomerResponse, CustomerType } from '@/types/customer';

interface CustomerBulkActionsProps {
    selectedCustomers: CustomerResponse[];
    onDeselect: () => void;
    onExport: (customers: CustomerResponse[]) => void;
    onSendEmail: (customers: CustomerResponse[]) => void;
    onActivate: (customerIds: number[]) => Promise<void>;
    onDeactivate: (customerIds: number[]) => Promise<void>;
    onUpdateType: (customerIds: number[], type: CustomerType) => Promise<void>;
    onAddTags: (customerIds: number[], tags: string[]) => Promise<void>;
    className?: string;
}

export const CustomerBulkActions: React.FC<CustomerBulkActionsProps> = ({
                                                                            selectedCustomers,
                                                                            onDeselect,
                                                                            onExport,
                                                                            onSendEmail,
                                                                            onActivate,
                                                                            onDeactivate,
                                                                            onUpdateType,
                                                                            onAddTags,
                                                                            className = ''
                                                                        }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{
        action: string;
        title: string;
        message: string;
        danger?: boolean;
    } | null>(null);

    const count = selectedCustomers.length;
    const activeCount = selectedCustomers.filter(c => c.isActive).length;
    const inactiveCount = count - activeCount;
    const retailCount = selectedCustomers.filter(c => c.type === CustomerType.RETAIL).length;
    const wholesaleCount = count - retailCount;

    if (count === 0) return null;

    const handleAction = async (
        actionKey: string,
        actionFn: () => Promise<void>,
        confirmConfig?: {
            title: string;
            message: string;
            danger?: boolean;
        }
    ) => {
        if (confirmConfig) {
            setShowConfirm({
                action: actionKey,
                ...confirmConfig
            });
            return;
        }

        try {
            setLoading(actionKey);
            await actionFn();
        } catch (error) {
            console.error(`Erro na ação ${actionKey}:`, error);
        } finally {
            setLoading(null);
        }
    };

    const executeConfirmedAction = async () => {
        if (!showConfirm) return;

        try {
            setLoading(showConfirm.action);

            switch (showConfirm.action) {
                case 'deactivate':
                    await onDeactivate(selectedCustomers.map(c => c.id));
                    break;
                case 'activate':
                    await onActivate(selectedCustomers.map(c => c.id));
                    break;
                case 'toRetail':
                    await onUpdateType(selectedCustomers.map(c => c.id), CustomerType.RETAIL);
                    break;
                case 'toWholesale':
                    await onUpdateType(selectedCustomers.map(c => c.id), CustomerType.WHOLESALE);
                    break;
            }
        } catch (error) {
            console.error('Erro ao executar ação confirmada:', error);
        } finally {
            setLoading(null);
            setShowConfirm(null);
        }
    };

    const actions = [
        {
            key: 'export',
            label: 'Exportar',
            icon: Download,
            color: 'text-blue-600 hover:text-blue-700',
            onClick: () => onExport(selectedCustomers)
        },
        {
            key: 'email',
            label: 'Enviar Email',
            icon: Mail,
            color: 'text-green-600 hover:text-green-700',
            onClick: () => onSendEmail(selectedCustomers),
            disabled: selectedCustomers.filter(c => c.email).length === 0
        },
        ...(inactiveCount > 0 ? [{
            key: 'activate',
            label: `Ativar (${inactiveCount})`,
            icon: UserCheck,
            color: 'text-green-600 hover:text-green-700',
            onClick: () => handleAction(
                'activate',
                () => onActivate(selectedCustomers.filter(c => !c.isActive).map(c => c.id)),
                {
                    title: 'Ativar Clientes',
                    message: `Deseja ativar ${inactiveCount} cliente(s) selecionado(s)?`
                }
            )
        }] : []),
        ...(activeCount > 0 ? [{
            key: 'deactivate',
            label: `Desativar (${activeCount})`,
            icon: UserX,
            color: 'text-red-600 hover:text-red-700',
            onClick: () => handleAction(
                'deactivate',
                () => onDeactivate(selectedCustomers.filter(c => c.isActive).map(c => c.id)),
                {
                    title: 'Desativar Clientes',
                    message: `Deseja desativar ${activeCount} cliente(s) selecionado(s)? Esta ação pode ser revertida.`,
                    danger: true
                }
            )
        }] : []),
        ...(wholesaleCount > 0 ? [{
            key: 'toRetail',
            label: `→ Varejo (${wholesaleCount})`,
            icon: Tag,
            color: 'text-purple-600 hover:text-purple-700',
            onClick: () => handleAction(
                'toRetail',
                () => onUpdateType(selectedCustomers.filter(c => c.type === CustomerType.WHOLESALE).map(c => c.id), CustomerType.RETAIL),
                {
                    title: 'Converter para Varejo',
                    message: `Deseja converter ${wholesaleCount} cliente(s) para pessoa física (varejo)?`
                }
            )
        }] : []),
        ...(retailCount > 0 ? [{
            key: 'toWholesale',
            label: `→ Atacado (${retailCount})`,
            icon: Tag,
            color: 'text-orange-600 hover:text-orange-700',
            onClick: () => handleAction(
                'toWholesale',
                () => onUpdateType(selectedCustomers.filter(c => c.type === CustomerType.RETAIL).map(c => c.id), CustomerType.WHOLESALE),
                {
                    title: 'Converter para Atacado',
                    message: `Deseja converter ${retailCount} cliente(s) para pessoa jurídica (atacado)?`
                }
            )
        }] : [])
    ];

    return (
        <>
            {/* Barra de ações */}
            <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center justify-between">
                    {/* Info dos selecionados */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-blue-900">
                                    {count} cliente{count !== 1 ? 's' : ''} selecionado{count !== 1 ? 's' : ''}
                                </div>
                                <div className="text-sm text-blue-700">
                                    {activeCount} ativo{activeCount !== 1 ? 's' : ''} • {retailCount} varejo • {wholesaleCount} atacado
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onDeselect}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Desmarcar todos"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            const isLoading = loading === action.key;
                            const isDisabled = action.disabled || isLoading;

                            return (
                                <button
                                    key={action.key}
                                    onClick={action.onClick}
                                    disabled={isDisabled}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                        isDisabled
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : `bg-white border-gray-200 hover:bg-gray-50 ${action.color}`
                                    }`}
                                    title={action.disabled ? 'Nenhum cliente válido para esta ação' : action.label}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal de confirmação */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            {showConfirm.danger ? (
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                            ) : (
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Check className="w-6 h-6 text-blue-600" />
                                </div>
                            )}
                            <h3 className="text-lg font-medium text-gray-900">
                                {showConfirm.title}
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {showConfirm.message}
                        </p>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={loading !== null}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={executeConfirmedAction}
                                disabled={loading !== null}
                                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                                    showConfirm.danger
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : null}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};