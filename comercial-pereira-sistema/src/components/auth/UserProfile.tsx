import {UserResponse, UserRole} from "@/types";
import React from "react";
import {CheckCircle, Crown, Mail, Shield, UserCheck, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Edit, Key} from "lucide-react";

interface UserProfileHeaderProps {
    user: UserResponse;
    onEdit: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onSendMessage?: () => void;
    loading?: boolean;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
                                                                        user,
                                                                        onEdit,
                                                                        onResetPassword,
                                                                        onToggleStatus,
                                                                        onSendMessage,
                                                                        loading = false
                                                                    }) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const getRoleConfig = (role: UserRole) => {
        const configs = {
            ADMIN: {
                label: 'Administrador',
                color: 'from-purple-500 to-purple-600',
                icon: Crown,
                description: 'Acesso total ao sistema'
            },
            MANAGER: {
                label: 'Gerente',
                color: 'from-blue-500 to-blue-600',
                icon: Shield,
                description: 'Gerenciamento de produtos e vendas'
            },
            SALESPERSON: {
                label: 'Vendedor',
                color: 'from-green-500 to-green-600',
                icon: UserCheck,
                description: 'Acesso às vendas e clientes'
            },
        };
        return configs[role];
    };

    const roleConfig = getRoleConfig(user.role);
    const RoleIcon = roleConfig.icon;

    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header Background */}
            <div className={`h-32 bg-gradient-to-r ${roleConfig.color} relative`}>
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            </div>

            {/* Profile Content */}
            <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex items-end justify-between">
                    <div className="flex items-end space-x-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-gray-600">
                  {getInitials(user.name)}
                </span>
                            </div>

                            {/* Status indicator */}
                            <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                                user.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                                {user.isActive ? (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-white" />
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="pb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600 text-lg mt-1">{user.email}</p>

                            {/* Role and Status */}
                            <div className="flex items-center space-x-3 mt-4">
                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${roleConfig.color}`}>
                                    <RoleIcon className="w-4 h-4 mr-2" />
                                    {roleConfig.label}
                                </div>

                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
                            </div>

                            <p className="text-gray-500 mt-2">{roleConfig.description}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pb-4">
                        {onSendMessage && (
                            <Button variant="secondary" size="sm" leftIcon={Mail}>
                                Mensagem
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={Key}
                            onClick={onResetPassword}
                            disabled={loading}
                        >
                            Reset Senha
                        </Button>

                        <Button
                            variant={user.isActive ? "danger" : "secondary"}
                            size="sm"
                            onClick={onToggleStatus}
                            disabled={loading}
                        >
                            {user.isActive ? 'Desativar' : 'Ativar'}
                        </Button>

                        <Button
                            size="sm"
                            leftIcon={Edit}
                            onClick={onEdit}
                        >
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <p className="text-2xl font-bold text-gray-900">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">Data de Criação</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-gray-400 mr-2" />
                            <p className="text-2xl font-bold text-gray-900">
                                {formatDate(user.updatedAt)}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">Última Atualização</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                            <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                        <p className="text-sm text-gray-500">Status Atual</p>
                    </div>
                </div>
            </div>
        </div>
    );
};