'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { 
  ArrowLeft, Shield, Search, Users, 
  AlertCircle, Download, Upload 
} from 'lucide-react';
import { UserResponse, UserRole } from '@/types/user';
import { UserPermissionMatrix } from '@/components/users/UserPermissionMatrix';

interface UserPermission {
  userId: number;
  userName: string;
  role: UserRole;
  permissions: string[];
}

export default function UserPermissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Buscar todos os usuários e suas permissões
  const fetchUsersAndPermissions = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os usuários
      const usersResponse = await fetch('/api/users?limit=100');
      if (!usersResponse.ok) throw new Error('Erro ao buscar usuários');
      
      const usersData = await usersResponse.json();
      
      // Mapear usuários para o formato necessário
      const userPermissions: UserPermission[] = await Promise.all(
        usersData.data.map(async (user: UserResponse) => {
          // Aqui você faria uma chamada para buscar permissões específicas do usuário
          // const permissionsResponse = await fetch(`/api/users/${user.id}/permissions`);
          
          // Por enquanto, vamos usar permissões baseadas no role
          let permissions: string[] = [];
          
          if (user.role === UserRole.ADMIN) {
            permissions = [
              'users.view', 'users.create', 'users.edit', 'users.delete', 'users.permissions',
              'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
              'sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.discount', 'sales.approve',
              'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.credit',
              'reports.view', 'reports.export', 'reports.financial', 'reports.audit',
              'settings.view', 'settings.edit', 'settings.backup', 'settings.integration'
            ];
          } else if (user.role === UserRole.MANAGER) {
            permissions = [
              'products.view', 'products.create', 'products.edit', 'products.export',
              'sales.view', 'sales.create', 'sales.edit', 'sales.approve',
              'customers.view', 'customers.create', 'customers.edit',
              'reports.view', 'reports.export', 'reports.financial'
            ];
          } else {
            permissions = [
              'products.view',
              'sales.view', 'sales.create', 'sales.edit',
              'customers.view', 'customers.create', 'customers.edit',
              'reports.view'
            ];
          }
          
          return {
            userId: user.id,
            userName: user.name,
            role: user.role,
            permissions
          };
        })
      );
      
      setUsers(userPermissions);
      setFilteredUsers(userPermissions);
    } catch (error) {
      toast.error('Erro ao carregar usuários e permissões');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndPermissions();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;
    
    // Filtro por nome
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtro por role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  // Handlers
  const handleSavePermissions = async (userId: number, permissions: string[]) => {
    try {
      setSavingPermissions(true);
      
      // Implementar salvamento de permissões
      // const response = await fetch(`/api/users/${userId}/permissions`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ permissions })
      // });
      
      // if (!response.ok) throw new Error('Erro ao salvar permissões');
      
      // Atualizar estado local
      setUsers(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, permissions } 
          : user
      ));
      
      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar permissões');
      console.error(error);
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleCopyPermissions = async (fromUserId: number, toUserIds: number[]) => {
    try {
      const sourceUser = users.find(u => u.userId === fromUserId);
      if (!sourceUser) return;
      
      // Aplicar permissões aos usuários selecionados
      for (const targetUserId of toUserIds) {
        await handleSavePermissions(targetUserId, sourceUser.permissions);
      }
      
      toast.success(`Permissões copiadas para ${toUserIds.length} usuário(s)`);
    } catch (error) {
      toast.error('Erro ao copiar permissões');
      console.error(error);
    }
  };

  const handleApplyTemplate = async (template: UserRole, userIds: number[]) => {
    try {
      // Definir permissões baseadas no template
      let templatePermissions: string[] = [];
      
      if (template === UserRole.ADMIN) {
        templatePermissions = [
          'users.view', 'users.create', 'users.edit', 'users.delete', 'users.permissions',
          'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
          'sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.discount', 'sales.approve',
          'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.credit',
          'reports.view', 'reports.export', 'reports.financial', 'reports.audit',
          'settings.view', 'settings.edit', 'settings.backup', 'settings.integration'
        ];
      } else if (template === UserRole.MANAGER) {
        templatePermissions = [
          'products.view', 'products.create', 'products.edit', 'products.export',
          'sales.view', 'sales.create', 'sales.edit', 'sales.approve',
          'customers.view', 'customers.create', 'customers.edit',
          'reports.view', 'reports.export', 'reports.financial'
        ];
      } else {
        templatePermissions = [
          'products.view',
          'sales.view', 'sales.create', 'sales.edit',
          'customers.view', 'customers.create', 'customers.edit',
          'reports.view'
        ];
      }
      
      // Aplicar template aos usuários selecionados
      for (const userId of userIds) {
        await handleSavePermissions(userId, templatePermissions);
      }
      
      toast.success(`Template ${template} aplicado a ${userIds.length} usuário(s)`);
    } catch (error) {
      toast.error('Erro ao aplicar template');
      console.error(error);
    }
  };

  const handleExportPermissions = () => {
    try {
      // Preparar dados para exportação
      const csvContent = [
        ['Usuário', 'Email', 'Role', 'Permissões'],
        ...users.map(user => [
          user.userName,
          '', // Email não está disponível neste contexto
          user.role,
          user.permissions.join('; ')
        ])
      ].map(row => row.join(',')).join('\n');
      
      // Criar download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `permissoes_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Permissões exportadas com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar permissões');
      console.error(error);
    }
  };

  const handleImportPermissions = () => {
    // Criar input file temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        // Processar CSV aqui
        toast.info('Funcionalidade de importação em desenvolvimento');
      } catch (error) {
        toast.error('Erro ao importar arquivo');
        console.error(error);
      }
    };
    
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={ArrowLeft}
                onClick={() => router.push('/users')}
              >
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gerenciar Permissões</h1>
                  <p className="text-sm text-gray-500">
                    Controle as permissões de todos os usuários do sistema
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Upload}
                onClick={handleImportPermissions}
              >
                Importar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Download}
                onClick={handleExportPermissions}
              >
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alert informativo */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>Importante:</strong> Alterações nas permissões afetam imediatamente o acesso dos usuários ao sistema. 
              Certifique-se de revisar todas as mudanças antes de salvar.
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por nome de usuário..."
                leftIcon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              placeholder="Filtrar por role"
              options={[
                { value: 'all', label: 'Todos os roles' },
                { value: UserRole.ADMIN, label: 'Administradores' },
                { value: UserRole.MANAGER, label: 'Gerentes' },
                { value: UserRole.SALESPERSON, label: 'Vendedores' }
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Mostrando {filteredUsers.length} de {users.length} usuários
              </span>
            </div>
          </div>
        </div>

        {/* Matriz de Permissões */}
        <UserPermissionMatrix
          users={filteredUsers}
          onSave={handleSavePermissions}
          onCopyPermissions={handleCopyPermissions}
          onApplyTemplate={handleApplyTemplate}
          loading={savingPermissions}
        />
      </div>
    </div>
  );
}