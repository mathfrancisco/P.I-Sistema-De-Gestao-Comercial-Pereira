'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserTable } from '@/components/auth/UserTable';
import { UserAnalyticsPanel } from '@/components/auth/UserAnalytics';
import { toast } from '@/components/ui/toast';
import { Grid3x3, List } from 'lucide-react';
import { 
  UserResponse, 
  UserFiltersInput, 
  UsersListResponse,
} from '@/lib/validations/users';
import { UserListHeader } from '@/components/auth/ UserListHeader';
import { UserListCard } from '@/components/users/UserListCard';

export default function UsersListPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [filters, setFilters] = useState<UserFiltersInput>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {} as Record<string, number>
  });

  // Buscar usuários
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page?.toString() || '1',
        limit: filters.limit?.toString() || '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive.toString() }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder })
      });

      const response = await fetch(`/api/users?${queryParams}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      
      const data: UsersListResponse = await response.json();
      setUsers(data.data);
      setPagination({
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalItems: data.pagination.total,
        itemsPerPage: data.pagination.limit
      });
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Buscar estatísticas
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/users/stats');
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');
      
      const data = await response.json();
      setStatistics({
        total: data.data.totalUsers,
        active: data.data.activeUsers,
        inactive: data.data.inactiveUsers,
        byRole: data.data.usersByRole
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [fetchUsers]);

  // Handlers
  const handleCreateUser = () => {
    router.push('/users/new');
  };

  const handleEditUser = (user: UserResponse) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleViewUser = (user: UserResponse) => {
    router.push(`/users/${user.id}`);
  };

  const handleDeleteUser = async (user: UserResponse) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Exclusão administrativa' })
      });

      if (!response.ok) throw new Error('Erro ao excluir usuário');
      
      toast.success('Usuário excluído com sucesso');
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
      console.error(error);
    }
  };

  const handleResetPassword = async (user: UserResponse) => {
    const newPassword = prompt(`Digite a nova senha para ${user.name}:`);
    if (!newPassword) return;

    const confirmPassword = prompt('Confirme a nova senha:');
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, confirmPassword })
      });

      if (!response.ok) throw new Error('Erro ao redefinir senha');
      
      toast.success('Senha redefinida com sucesso');
    } catch (error) {
      toast.error('Erro ao redefinir senha');
      console.error(error);
    }
  };

  const handleToggleStatus = async (user: UserResponse) => {
    const action = user.isActive ? 'desativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`)) return;

    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: !user.isActive,
          reason: `${user.isActive ? 'Desativação' : 'Ativação'} administrativa`
        })
      });

      if (!response.ok) throw new Error(`Erro ao ${action} usuário`);
      
      toast.success(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso`);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      toast.error(`Erro ao ${user.isActive ? 'desativar' : 'ativar'} usuário`);
      console.error(error);
    }
  };

  const handleFiltersChange = (newFilters: Partial<UserFiltersInput>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (items: number) => {
    setFilters(prev => ({ ...prev, limit: items, page: 1 }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy: column as any, sortOrder: direction }));
  };

  const handleBulkAction = async (action: string) => {
    switch(action) {
      case 'activate':
      case 'deactivate':
        const isActive = action === 'activate';
        for (const userId of selectedUsers) {
          try {
            await fetch(`/api/users/${userId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive, reason: `${action} em massa` })
            });
          } catch (error) {
            console.error(`Erro ao ${action} usuário ${userId}:`, error);
          }
        }
        toast.success(`Usuários ${isActive ? 'ativados' : 'desativados'} com sucesso`);
        fetchUsers();
        fetchStatistics();
        setSelectedUsers([]);
        break;
      
      case 'export':
        // Implementar exportação
        toast.info('Funcionalidade de exportação em desenvolvimento');
        break;
    }
  };

  const handleExport = async () => {
    try {
      // Implementar exportação de todos os usuários
      toast.info('Exportação iniciada...');
      // const response = await fetch('/api/users/export');
      // Processar download do arquivo
    } catch (error) {
      toast.error('Erro ao exportar usuários');
    }
  };

  const handleImport = () => {
    // Implementar importação
    toast.info('Funcionalidade de importação em desenvolvimento');
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    setSelectedUsers(selectAll ? users.map(u => u.id) : []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UserListHeader
        onCreateUser={handleCreateUser}
        onImport={handleImport}
        onExport={handleExport}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalUsers={pagination.totalItems}
        selectedCount={selectedUsers.length}
        onBulkAction={handleBulkAction}
      />

      <div className="p-6 space-y-6">
        {/* Analytics */}
        <UserAnalyticsPanel
          statistics={statistics}
          loading={loading}
        />

        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex items-center bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              title="Visualização em tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              title="Visualização em cards"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Users List */}
        {viewMode === 'table' ? (
          <UserTable
            users={users}
            loading={loading}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewUser={handleViewUser}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
            pagination={{
              ...pagination,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange
            }}
            onSort={handleSort}
            sortColumn={filters.sortBy}
            sortDirection={filters.sortOrder}
          />
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <UserListCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onViewDetails={handleViewUser}
                selected={selectedUsers.includes(user.id)}
                onSelect={() => handleSelectUser(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}