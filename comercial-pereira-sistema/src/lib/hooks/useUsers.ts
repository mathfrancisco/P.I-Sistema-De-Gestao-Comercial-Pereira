import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/toast';
import {
  UserResponse,
  CreateUserInput,
  UpdateUserInput,
  UserFiltersInput,
  UsersListResponse,
  UserRole,
  UpdateStatusInput,
  ResetPasswordInput
} from '@/lib/validations/users';

interface UseUsersReturn {
  // Estado
  users: UserResponse[];
  loading: boolean;
  error: string | null;
  selectedUsers: number[];
  filters: UserFiltersInput;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  statistics: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  
  // Ações
  fetchUsers: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<UserResponse | null>;
  updateUser: (id: number, data: UpdateUserInput) => Promise<UserResponse | null>;
  deleteUser: (id: number, reason?: string) => Promise<boolean>;
  toggleUserStatus: (id: number, isActive: boolean, reason?: string) => Promise<UserResponse | null>;
  resetUserPassword: (id: number, password: string, confirmPassword: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<UserResponse[]>;
  getUserById: (id: number) => Promise<UserResponse | null>;
  getUsersByRole: (role: UserRole) => Promise<UserResponse[]>;
  getActiveUsers: () => Promise<UserResponse[]>;
  
  // Gerenciamento de filtros e seleção
  setFilters: (filters: Partial<UserFiltersInput>) => void;
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
  selectUser: (userId: number) => void;
  deselectUser: (userId: number) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  
  // Utilidades
  refreshData: () => Promise<void>;
  exportUsers: (userIds?: number[]) => Promise<void>;
  importUsers: (file: File) => Promise<void>;
  bulkUpdateStatus: (userIds: number[], isActive: boolean) => Promise<void>;
  bulkDelete: (userIds: number[]) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch all users with filters
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      
      const data: UsersListResponse = await response.json();
      setUsers(data.data);
      setPagination({
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalItems: data.pagination.total,
        itemsPerPage: data.pagination.limit
      });
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/users/stats');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      
      const data = await response.json();
      setStatistics({
        total: data.data.totalUsers,
        active: data.data.activeUsers,
        inactive: data.data.inactiveUsers,
        byRole: data.data.usersByRole
      });
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (data: CreateUserInput): Promise<UserResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }
      
      const result = await response.json();
      toast.success('Usuário criado com sucesso');
      await refreshData();
      return result.data;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (id: number, data: UpdateUserInput): Promise<UserResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }
      
      const result = await response.json();
      toast.success('Usuário atualizado com sucesso');
      await refreshData();
      return result.data;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: number, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Exclusão administrativa' })
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }
      
      toast.success('Usuário excluído com sucesso');
      await refreshData();
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao excluir usuário');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle user status
  const toggleUserStatus = useCallback(async (
    id: number, 
    isActive: boolean, 
    reason?: string
  ): Promise<UserResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive,
          reason: reason || `${isActive ? 'Ativação' : 'Desativação'} administrativa`
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isActive ? 'ativar' : 'desativar'} usuário`);
      }
      
      const result = await response.json();
      toast.success(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`);
      await refreshData();
      return result.data;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset user password
  const resetUserPassword = useCallback(async (
    id: number, 
    password: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword })
      });

      if (!response.ok) {
        throw new Error('Erro ao redefinir senha');
      }
      
      toast.success('Senha redefinida com sucesso');
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao redefinir senha');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query: string): Promise<UserResponse[]> => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err: any) {
      console.error('Erro na busca:', err);
      return [];
    }
  }, []);

  // Get user by ID
  const getUserById = useCallback(async (id: number): Promise<UserResponse | null> => {
    try {
      const response = await fetch(`/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err: any) {
      console.error('Erro ao buscar usuário:', err);
      return null;
    }
  }, []);

  // Get users by role
  const getUsersByRole = useCallback(async (role: UserRole): Promise<UserResponse[]> => {
    try {
      const response = await fetch(`/api/users/roles/${role.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários por role');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err: any) {
      console.error('Erro ao buscar usuários por role:', err);
      return [];
    }
  }, []);

  // Get active users
  const getActiveUsers = useCallback(async (): Promise<UserResponse[]> => {
    try {
      const response = await fetch('/api/users/active');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários ativos');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err: any) {
      console.error('Erro ao buscar usuários ativos:', err);
      return [];
    }
  }, []);

  // Select/Deselect users
  const selectUser = useCallback((userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev : [...prev, userId]
    );
  }, []);

  const deselectUser = useCallback((userId: number) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.map(u => u.id));
  }, [users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchStatistics()]);
  }, [fetchUsers, fetchStatistics]);

  // Export users
  const exportUsers = useCallback(async (userIds?: number[]) => {
    try {
      const usersToExport = userIds 
        ? users.filter(u => userIds.includes(u.id))
        : users;
      
      const csvContent = [
        ['ID', 'Nome', 'Email', 'Role', 'Status', 'Criado em', 'Atualizado em'],
        ...usersToExport.map(user => [
          user.id,
          user.name,
          user.email,
          user.role,
          user.isActive ? 'Ativo' : 'Inativo',
          new Date(user.createdAt).toLocaleDateString('pt-BR'),
          new Date(user.updatedAt).toLocaleDateString('pt-BR')
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Usuários exportados com sucesso');
    } catch (err: any) {
      toast.error('Erro ao exportar usuários');
      console.error(err);
    }
  }, [users]);

  // Import users
  const importUsers = useCallback(async (file: File) => {
    try {
      // Implementar importação de usuários
      toast.info('Funcionalidade de importação em desenvolvimento');
      
      // const formData = new FormData();
      // formData.append('file', file);
      
      // const response = await fetch('/api/users/import', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // if (!response.ok) {
      //   throw new Error('Erro ao importar usuários');
      // }
      
      // await refreshData();
      // toast.success('Usuários importados com sucesso');
    } catch (err: any) {
      toast.error('Erro ao importar usuários');
      console.error(err);
    }
  }, []);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (userIds: number[], isActive: boolean) => {
    try {
      setLoading(true);
      const promises = userIds.map(id => 
        toggleUserStatus(id, isActive, `${isActive ? 'Ativação' : 'Desativação'} em massa`)
      );
      
      await Promise.all(promises);
      toast.success(`${userIds.length} usuários ${isActive ? 'ativados' : 'desativados'}`);
      clearSelection();
    } catch (err: any) {
      toast.error('Erro ao atualizar status dos usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toggleUserStatus, clearSelection]);

  // Bulk delete
  const bulkDelete = useCallback(async (userIds: number[]) => {
    try {
      setLoading(true);
      const promises = userIds.map(id => deleteUser(id, 'Exclusão em massa'));
      
      await Promise.all(promises);
      toast.success(`${userIds.length} usuários excluídos`);
      clearSelection();
    } catch (err: any) {
      toast.error('Erro ao excluir usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deleteUser, clearSelection]);

  // Auto-load data on mount
  useEffect(() => {
    refreshData();
  }, [filters]);

  return {
    // Estado
    users,
    loading,
    error,
    selectedUsers,
    filters,
    pagination,
    statistics,
    
    // Ações
    fetchUsers,
    fetchStatistics,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    searchUsers,
    getUserById,
    getUsersByRole,
    getActiveUsers,
    
    // Gerenciamento de filtros e seleção
    setFilters: (newFilters: Partial<UserFiltersInput>) => {
      setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    },
    setSelectedUsers,
    selectUser,
    deselectUser,
    selectAllUsers,
    clearSelection,
    
    // Utilidades
    refreshData,
    exportUsers,
    importUsers,
    bulkUpdateStatus,
    bulkDelete
  };
};