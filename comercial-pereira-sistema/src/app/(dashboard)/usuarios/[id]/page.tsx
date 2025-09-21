'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserProfileHeader } from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, Download } from 'lucide-react';
import { UserResponse, UserRole } from '@/types/user';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserActivity, UserActivityLog } from '@/components/users/UserActivityLog';
import { UserPermissionMatrix } from '@/components/users/UserPermissionMatrix';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Buscar dados do usuário
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar usuário');
      
      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      toast.error('Erro ao carregar usuário');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar atividades do usuário (simulado por enquanto)
  const fetchActivities = async () => {
    try {
      // Aqui você implementaria a chamada real para buscar atividades
      // const response = await fetch(`/api/users/${userId}/activities`);
      
      // Dados simulados para demonstração
      const mockActivities: UserActivity[] = [
        {
          id: 1,
          userId: parseInt(userId),
          action: 'login',
          module: 'auth',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: 2,
          userId: parseInt(userId),
          action: 'create',
          module: 'sales',
          resourceId: 123,
          details: { amount: 'R$ 1.250,00', customer: 'João Silva' },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: 3,
          userId: parseInt(userId),
          action: 'edit',
          module: 'products',
          resourceId: 456,
          details: { field: 'price', oldValue: 'R$ 100', newValue: 'R$ 120' },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: 4,
          userId: parseInt(userId),
          action: 'export',
          module: 'reports',
          details: { reportType: 'vendas_mensal', format: 'PDF' },
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: 5,
          userId: parseInt(userId),
          action: 'logout',
          module: 'auth',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  // Buscar permissões do usuário
  const fetchPermissions = async () => {
    try {
      // Aqui você implementaria a chamada real para buscar permissões
      // const response = await fetch(`/api/users/${userId}/permissions`);
      
      // Permissões baseadas no role do usuário
      if (user?.role === UserRole.ADMIN) {
        setPermissions(['*']); // Todas as permissões
      } else if (user?.role === UserRole.MANAGER) {
        setPermissions([
          'products.view', 'products.create', 'products.edit',
          'sales.view', 'sales.create', 'sales.edit',
          'customers.view', 'customers.create', 'customers.edit',
          'reports.view', 'reports.export'
        ]);
      } else {
        setPermissions([
          'products.view',
          'sales.view', 'sales.create',
          'customers.view', 'customers.create'
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchActivities();
  }, [userId]);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    }
  }, [user]);

  // Handlers
  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleResetPassword = async () => {
    const newPassword = prompt(`Digite a nova senha para ${user?.name}:`);
    if (!newPassword) return;

    const confirmPassword = prompt('Confirme a nova senha:');
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/password`, {
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

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const action = user.isActive ? 'desativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: !user.isActive,
          reason: `${user.isActive ? 'Desativação' : 'Ativação'} administrativa`
        })
      });

      if (!response.ok) throw new Error(`Erro ao ${action} usuário`);
      
      toast.success(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso`);
      fetchUser();
    } catch (error) {
      toast.error(`Erro ao ${user?.isActive ? 'desativar' : 'ativar'} usuário`);
      console.error(error);
    }
  };

  const handleExportActivities = async () => {
    try {
      // Implementar exportação de atividades
      toast.info('Exportação de atividades iniciada...');
      
      // Converter atividades para CSV
      const csvContent = [
        ['Data/Hora', 'Ação', 'Módulo', 'Detalhes', 'IP', 'Status'],
        ...activities.map(a => [
          new Date(a.timestamp).toLocaleString('pt-BR'),
          a.action,
          a.module,
          JSON.stringify(a.details || {}),
          a.ipAddress || '',
          a.status || ''
        ])
      ].map(row => row.join(',')).join('\n');

      // Criar download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `atividades_usuario_${userId}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Atividades exportadas com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar atividades');
      console.error(error);
    }
  };

  const handleSavePermissions = async (targetUserId: number, newPermissions: string[]) => {
    try {
      // Implementar salvamento de permissões
      // const response = await fetch(`/api/users/${targetUserId}/permissions`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ permissions: newPermissions })
      // });
      
      toast.success('Permissões atualizadas com sucesso');
      setPermissions(newPermissions);
    } catch (error) {
      toast.error('Erro ao salvar permissões');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <Button onClick={() => router.push('/users')} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={ArrowLeft}
                onClick={() => router.push('/users')}
              >
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="mb-6">
          <UserProfileHeader
            user={user}
            onEdit={handleEdit}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Tabs com conteúdo */}
        <div className="bg-white rounded-xl border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-gray-200 px-6">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Nome Completo</p>
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Função</p>
                      <p className="text-gray-900 font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informações da Conta</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-gray-900 font-medium">{user.isActive ? 'Ativo' : 'Inativo'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Criado em</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última atualização</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(user.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="p-0">
              <UserActivityLog
                activities={activities}
                onExport={handleExportActivities}
                hasMore={false}
              />
            </TabsContent>

            <TabsContent value="permissions" className="p-0">
              <UserPermissionMatrix
                users={[
                  {
                    userId: parseInt(userId),
                    userName: user.name,
                    role: user.role,
                    permissions
                  }
                ]}
                onSave={handleSavePermissions}
              />
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Configurações do Usuário</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    As configurações específicas do usuário podem ser gerenciadas aqui.
                  </p>
                  <Button className="mt-4" onClick={handleEdit}>
                    Editar Configurações
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}