import React, { useState } from 'react';
import { 
  LogIn, LogOut, Edit, Trash, Shield, UserPlus, 
  Key, Download, Filter, Calendar, Monitor, Globe,
  AlertCircle, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  module: string;
  resourceId?: number;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'warning' | 'error';
}

interface UserActivityLogProps {
  activities: UserActivity[];
  loading?: boolean;
  onExport?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const UserActivityLog: React.FC<UserActivityLogProps> = ({
  activities,
  loading = false,
  onExport,
  onLoadMore,
  hasMore = false
}) => {
  const [filterType, setFilterType] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const actionIcons: Record<string, any> = {
    'login': LogIn,
    'logout': LogOut,
    'create': UserPlus,
    'edit': Edit,
    'delete': Trash,
    'permission_change': Shield,
    'password_reset': Key,
    'export': Download,
    'status_change': CheckCircle
  };

  const actionColors: Record<string, string> = {
    'login': 'bg-green-100 text-green-600',
    'logout': 'bg-gray-100 text-gray-600',
    'create': 'bg-blue-100 text-blue-600',
    'edit': 'bg-yellow-100 text-yellow-600',
    'delete': 'bg-red-100 text-red-600',
    'permission_change': 'bg-purple-100 text-purple-600',
    'password_reset': 'bg-orange-100 text-orange-600',
    'export': 'bg-indigo-100 text-indigo-600',
    'status_change': 'bg-teal-100 text-teal-600'
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || AlertCircle;
    return Icon;
  };

  const getActionColor = (action: string) => {
    return actionColors[action] || 'bg-gray-100 text-gray-600';
  };

  const getActionDescription = (activity: UserActivity) => {
    const descriptions: Record<string, string> = {
      'login': 'Realizou login no sistema',
      'logout': 'Realizou logout do sistema',
      'create': `Criou novo registro em ${activity.module}`,
      'edit': `Editou registro #${activity.resourceId} em ${activity.module}`,
      'delete': `Excluiu registro #${activity.resourceId} de ${activity.module}`,
      'permission_change': 'Alterou permissões de usuário',
      'password_reset': 'Redefiniu senha de usuário',
      'export': `Exportou dados de ${activity.module}`,
      'status_change': `Alterou status de registro em ${activity.module}`
    };
    return descriptions[activity.action] || activity.action;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return { device: 'Desconhecido', browser: 'Desconhecido' };
    
    // Simplificado - você pode usar uma lib como ua-parser-js para melhor detecção
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const device = isMobile ? 'Mobile' : 'Desktop';
    
    let browser = 'Desconhecido';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    return { device, browser };
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'warning': return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filterType !== 'all' && activity.action !== filterType) return false;
    if (filterModule !== 'all' && activity.module !== filterModule) return false;
    
    if (filterDate !== 'all') {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch(filterDate) {
        case 'today':
          return activityDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return activityDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return activityDate >= monthAgo;
        default:
          return true;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header com filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Atividades</h3>
          {onExport && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={Download}
              onClick={onExport}
            >
              Exportar para Auditoria
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            placeholder="Tipo de Ação"
            options={[
              { value: 'all', label: 'Todas as ações' },
              { value: 'login', label: 'Login/Logout' },
              { value: 'create', label: 'Criações' },
              { value: 'edit', label: 'Edições' },
              { value: 'delete', label: 'Exclusões' },
              { value: 'permission_change', label: 'Alteração de Permissões' }
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          
          <Select
            placeholder="Módulo"
            options={[
              { value: 'all', label: 'Todos os módulos' },
              { value: 'users', label: 'Usuários' },
              { value: 'products', label: 'Produtos' },
              { value: 'sales', label: 'Vendas' },
              { value: 'customers', label: 'Clientes' },
              { value: 'reports', label: 'Relatórios' }
            ]}
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          />
          
          <Select
            placeholder="Período"
            options={[
              { value: 'all', label: 'Todo o período' },
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Última semana' },
              { value: 'month', label: 'Último mês' }
            ]}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Timeline de Atividades */}
      <div className="p-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => {
                const Icon = getActionIcon(activity.action);
                const deviceInfo = getDeviceInfo(activity.userAgent);
                
                return (
                  <div key={activity.id} className="relative flex items-start">
                    {/* Ícone da ação */}
                    <div className={`
                      relative z-10 w-10 h-10 rounded-lg flex items-center justify-center
                      ${getActionColor(activity.action)}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="ml-4 flex-1">
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {getActionDescription(activity)}
                              </p>
                              {getStatusIcon(activity.status)}
                            </div>
                            
                            {/* Detalhes adicionais */}
                            {activity.details && Object.keys(activity.details).length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
                                {Object.entries(activity.details).map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <span className="font-medium mr-1">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Metadados */}
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(activity.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </div>
                              
                              {activity.ipAddress && (
                                <div className="flex items-center">
                                  <Globe className="w-3 h-3 mr-1" />
                                  {activity.ipAddress}
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Monitor className="w-3 h-3 mr-1" />
                                {deviceInfo.device} • {deviceInfo.browser}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 text-xs text-gray-400">
                            {formatDistanceToNow(new Date(activity.timestamp), { 
                              locale: ptBR, 
                              addSuffix: true 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão para carregar mais */}
        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="secondary"
              onClick={onLoadMore}
              disabled={loading}
            >
              Carregar mais atividades
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};