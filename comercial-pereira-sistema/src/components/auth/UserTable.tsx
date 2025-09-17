import React from 'react';
import {
    UserResponse,
    UserRole
} from '@/lib/validations/users';
import {CheckCircle, Crown, Edit, Eye, Key, Shield, Trash2, UserCheck, Users, UserX, XCircle} from "lucide-react";
import {EmptyState} from "@/components/layout/feedback";
import {DataTable} from "@/components/layout/data-table";

interface UserTableProps {
    users: UserResponse[];
    loading?: boolean;
    selectedUsers?: number[];
    onSelectUser?: (id: number) => void;
    onSelectAll?: (selectAll: boolean) => void;
    onEditUser: (user: UserResponse) => void;
    onDeleteUser: (user: UserResponse) => void;
    onViewUser: (user: UserResponse) => void;
    onResetPassword: (user: UserResponse) => void;
    onToggleStatus: (user: UserResponse) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        onPageChange: (page: number) => void;
        onItemsPerPageChange: (items: number) => void;
    };
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}

export const UserTable: React.FC<UserTableProps> = ({
                                                        users,
                                                        loading,
                                                        selectedUsers = [],
                                                        onSelectUser,
                                                        onSelectAll,
                                                        onEditUser,
                                                        onDeleteUser,
                                                        onViewUser,
                                                        onResetPassword,
                                                        onToggleStatus,
                                                        pagination,
                                                        onSort,
                                                        sortColumn,
                                                        sortDirection
                                                    }) => {
    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'ADMIN': return Crown;
            case 'MANAGER': return Shield;
            case 'SALESPERSON': return UserCheck;
            default: return Users;
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const roleConfig = {
            ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
            MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            SALESPERSON: { label: 'Vendedor', color: 'bg-green-100 text-green-800 border-green-200' },
        };

        const config = roleConfig[role];
        const RoleIcon = getRoleIcon(role);

        return (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <RoleIcon className="w-3 h-3 mr-1" />
                {config.label}
      </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inativo
      </span>
        );
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    icon={Users}
                    title="Nenhum usuário encontrado"
                    description="Não há usuários que correspondam aos filtros aplicados."
                />
            </div>
        );
    }

    const tableData = users.map(user => ({
        id: String(user.id),
        user: (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(user.name)}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>
        ),
        role: getRoleBadge(user.role),
        status: getStatusBadge(user.isActive),
        createdAt: (
            <span className="text-sm text-gray-500">
        {formatDate(user.createdAt)}
      </span>
        ),
        actions: (
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => onViewUser(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Visualizar"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onEditUser(user)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Editar"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onResetPassword(user)}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                    title="Redefinir Senha"
                >
                    <Key className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onToggleStatus(user)}
                    className={`p-2 transition-all rounded-lg ${
                        user.isActive
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={user.isActive ? 'Desativar' : 'Ativar'}
                >
                    {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => onDeleteUser(user)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        )
    }));

    const tableColumns = [
        { key: 'user', label: 'Usuário', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Criado em', sortable: true },
        { key: 'actions', label: 'Ações' }
    ];

    return (
        <DataTable
            columns={tableColumns}
            data={tableData}
            selectable={!!onSelectUser}
            selectedRows={selectedUsers.map(String)}
            onSelectRow={(id) => onSelectUser?.(Number(id))}
            onSelectAll={onSelectAll}
            onSort={onSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
};
