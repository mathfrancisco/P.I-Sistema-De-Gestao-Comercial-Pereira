// components/customers/CustomerProfileHeader.tsx
import React from 'react';
import {
    User, Building, Edit, MessageCircle, ShoppingCart,
    Calendar, DollarSign, Package, Star, Crown,
    CheckCircle, XCircle, Phone, Mail, MapPin
} from 'lucide-react';
import {
    CustomerWithStats,
    CustomerType,
    formatDocument,
    getCustomerSegment
} from '@/types/customer';

interface CustomerProfileHeaderProps {
    customer: CustomerWithStats;
    onEdit: () => void;
    onNewSale: () => void;
    onSendMessage?: () => void;
    className?: string;
}

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
                                                                                customer,
                                                                                onEdit,
                                                                                onNewSale,
                                                                                onSendMessage,
                                                                                className = ''
                                                                            }) => {
    // Gerar avatar com iniciais
    const getCustomerAvatar = (name: string) => {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
        ];

        const colorIndex = name.length % colors.length;

        return (
            <div className={`w-20 h-20 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                {initials}
            </div>
        );
    };

    // Determinar segmento do cliente
    const segment = getCustomerSegment(customer.statistics);

    // Badge configs
    const getSegmentBadge = () => {
        const badges = {
            VIP: { color: 'bg-yellow-100 text-yellow-800', icon: Crown, label: 'VIP' },
            FREQUENT: { color: 'bg-blue-100 text-blue-800', icon: Star, label: 'Frequente' },
            REGULAR: { color: 'bg-gray-100 text-gray-800', icon: User, label: 'Regular' },
            NEW: { color: 'bg-green-100 text-green-800', icon: Package, label: 'Novo' },
            INACTIVE: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Inativo' }
        };

        const badge = badges[segment];
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
                {badge.label}
      </span>
        );
    };

    // Formatar data da última compra
    const formatLastPurchase = (date?: Date) => {
        if (!date) return 'Nunca';

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
        return `${Math.floor(diffDays / 365)} anos atrás`;
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            <div className="h-30 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-black bg-opacity-10" />

                {/* Content */}
                <div className="relative p-6">
                    <div className="flex items-start justify-between">
                        {/* Avatar e informações principais */}
                        <div className="flex items-start gap-4">
                            {getCustomerAvatar(customer.name)}

                            <div className="text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                                    {getSegmentBadge()}

                                    {/* Tipo de cliente */}
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        customer.type === CustomerType.RETAIL
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800'
                                    }`}>
                    {customer.type === CustomerType.RETAIL ? (
                        <>
                            <User className="w-3 h-3" />
                            Varejo
                        </>
                    ) : (
                        <>
                            <Building className="w-3 h-3" />
                            Atacado
                        </>
                    )}
                  </span>
                                </div>

                                <div className="space-y-1 text-blue-100">
                                    {customer.document && (
                                        <p className="text-sm">
                                            {customer.type === CustomerType.RETAIL ? 'CPF: ' : 'CNPJ: '}
                                            {formatDocument(customer.document)}
                                        </p>
                                    )}

                                    <p className="text-sm">
                                        Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                                    </p>

                                    {/* Status */}
                                    <div className="flex items-center gap-1">
                                        {customer.isActive ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">Ativo</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4" />
                                                <span className="text-sm">Inativo</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>

                            {onSendMessage && (
                                <button
                                    onClick={onSendMessage}
                                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Mensagem
                                </button>
                            )}

                            <button
                                onClick={onNewSale}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Nova Venda
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Total de compras */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {customer.statistics.totalSales}
                        </div>
                        <div className="text-sm text-gray-500">Compras</div>
                    </div>

                    {/* Valor total gasto */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            R$ {customer.statistics.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500">Total Gasto</div>
                    </div>

                    {/* Ticket médio */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            R$ {customer.statistics.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500">Ticket Médio</div>
                    </div>

                    {/* Última compra */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2">
                            <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatLastPurchase(customer.statistics.lastPurchase)}
                        </div>
                        <div className="text-sm text-gray-500">Última Compra</div>
                    </div>
                </div>
            </div>

            {/* Informações de contato */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Email */}
                    {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a
                                href={`mailto:${customer.email}`}
                                className="hover:text-blue-600 hover:underline"
                            >
                                {customer.email}
                            </a>
                        </div>
                    )}

                    {/* Telefone */}
                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a
                                href={`tel:${customer.phone}`}
                                className="hover:text-blue-600 hover:underline"
                            >
                                {customer.phone}
                            </a>
                        </div>
                    )}

                    {/* Localização */}
                    {customer.city && customer.state && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{customer.city}, {customer.state}</span>
                        </div>
                    )}
                </div>

                {/* Categorias favoritas */}
                {customer.statistics.favoriteCategories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Categorias Favoritas</h4>
                        <div className="flex flex-wrap gap-2">
                            {customer.statistics.favoriteCategories.slice(0, 3).map((category, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                  {category.categoryName}
                                    <span className="ml-1 text-blue-600">
                    ({category.purchaseCount})
                  </span>
                </span>
                            ))}
                            {customer.statistics.favoriteCategories.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{customer.statistics.favoriteCategories.length - 3} mais
                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};