import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { UserRole } from '@/types/user';
import {UserFiltersInput} from "@/lib/validations/users";

// ========================================
// 1. USER LIST HEADER COMPONENT
// ========================================

interface UserListHeaderProps {
    onCreateUser: () => void;
    onImport?: () => void;
    onExport?: () => void;
    filters: UserFiltersInput;
    onFiltersChange: (filters: Partial<UserFiltersInput>) => void;
    totalUsers?: number;
    selectedCount?: number;
    onBulkAction?: (action: string) => void;
}

export const UserListHeader: React.FC<UserListHeaderProps> = ({
                                                                  onCreateUser,
                                                                  onImport,
                                                                  onExport,
                                                                  filters,
                                                                  onFiltersChange,
                                                                  totalUsers = 0,
                                                                  selectedCount = 0,
                                                                  onBulkAction
                                                              }) => {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFiltersChange({ search: searchValue });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFiltersChange]);

    const roleOptions = [
        { value: '', label: 'Todos os roles' },
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'MANAGER', label: 'Gerente' },
        { value: 'SALESPERSON', label: 'Vendedor' },
    ];

    const statusOptions = [
        { value: '', label: 'Todos os status' },
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
    ];

    return (
        <div className="bg-white border-b border-gray-200 p-6">
            {/* Title and Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                        <p className="text-sm text-gray-500">
                            Mostrando {totalUsers} usuários cadastrados
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {onImport && (
                        <Button variant="secondary" leftIcon={Upload} onClick={onImport}>
                            Importar
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="secondary" leftIcon={Download} onClick={onExport}>
                            Exportar
                        </Button>
                    )}
                    <Button leftIcon={UserPlus} onClick={onCreateUser}>
                        Novo Usuário
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedCount > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedCount} usuários selecionados
          </span>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => onBulkAction?.('export')}>
                            Exportar Selecionados
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onBulkAction?.('activate')}>
                            Ativar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onBulkAction?.('deactivate')}>
                            Desativar
                        </Button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <Input
                        placeholder="Buscar por nome ou email..."
                        leftIcon={Search}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <Select
                    placeholder="Filtrar por role"
                    options={roleOptions}
                    value={filters.role || ''}
                    onValueChange={(value) => onFiltersChange({ role: value as UserRole || undefined })}
                />

                <Select
                    placeholder="Filtrar por status"
                    options={statusOptions}
                    value={filters.isActive !== undefined ? String(filters.isActive) : ''}
                    onValueChange={(value) => onFiltersChange({
                        isActive: value ? value === 'true' : undefined
                    })}
                />
            </div>
        </div>
    );
};