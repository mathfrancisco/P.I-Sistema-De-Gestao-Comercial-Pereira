import React, { useState } from 'react';
import { 
  User, Lock, Shield, Settings, Eye, EyeOff, 
  Check, X, AlertCircle, ChevronRight 
} from 'lucide-react';
import { UserRole, CreateUserInput, UpdateUserInput } from '@/lib/validations/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';


interface UserFormProps {
  user?: UpdateUserInput & { id?: number };
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

type TabKey = 'personal' | 'access' | 'permissions' | 'settings';

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [formData, setFormData] = useState<CreateUserInput | UpdateUserInput>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || UserRole.SALESPERSON,
    isActive: user?.isActive !== undefined ? user.isActive : true,
    permissions: [],
    settings: {
      notifications: true,
      twoFactor: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { key: 'personal' as TabKey, label: 'Informações Pessoais', icon: User },
    { key: 'access' as TabKey, label: 'Dados de Acesso', icon: Lock },
    { key: 'permissions' as TabKey, label: 'Permissões Especiais', icon: Shield },
    { key: 'settings' as TabKey, label: 'Configurações', icon: Settings }
  ];

  const roleOptions = [
    { 
      value: UserRole.ADMIN, 
      label: 'Administrador',
      description: 'Acesso total ao sistema, gerenciamento de usuários e configurações'
    },
    { 
      value: UserRole.MANAGER, 
      label: 'Gerente',
      description: 'Gerenciamento de produtos, vendas e relatórios'
    },
    { 
      value: UserRole.SALESPERSON, 
      label: 'Vendedor',
      description: 'Acesso às vendas, clientes e consulta de produtos'
    }
  ];

  const permissionGroups = {
    'Módulo de Produtos': [
      { id: 'products.create', label: 'Criar produtos' },
      { id: 'products.edit', label: 'Editar produtos' },
      { id: 'products.delete', label: 'Excluir produtos' },
      { id: 'products.import', label: 'Importar produtos' }
    ],
    'Módulo de Vendas': [
      { id: 'sales.create', label: 'Criar vendas' },
      { id: 'sales.edit', label: 'Editar vendas' },
      { id: 'sales.cancel', label: 'Cancelar vendas' },
      { id: 'sales.discount', label: 'Aplicar descontos especiais' }
    ],
    'Módulo de Clientes': [
      { id: 'customers.create', label: 'Criar clientes' },
      { id: 'customers.edit', label: 'Editar clientes' },
      { id: 'customers.delete', label: 'Excluir clientes' },
      { id: 'customers.credit', label: 'Gerenciar crédito' }
    ],
    'Relatórios': [
      { id: 'reports.view', label: 'Visualizar relatórios' },
      { id: 'reports.export', label: 'Exportar relatórios' },
      { id: 'reports.financial', label: 'Relatórios financeiros' },
      { id: 'reports.audit', label: 'Relatórios de auditoria' }
    ]
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 5));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...(prev.permissions || []), permissionId]
    }));
  };

  const handleSettingChange = (setting: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [setting]: value }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    
    if (mode === 'create' || formData.password) {
      if (!formData.password) newErrors.password = 'Senha é obrigatória';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }
      await onSubmit(submitData);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    const texts = ['Muito Fraca', 'Fraca', 'Regular', 'Boa', 'Forte', 'Muito Forte'];
    return texts[passwordStrength] || 'Muito Fraca';
  };

  return (
    <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Tabs Verticais */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h3>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <tab.icon className="w-4 h-4 mr-3" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
              {activeTab === tab.key && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo do Formulário */}
      <div className="flex-1 p-8">
        {/* Tab 1: Informações Pessoais */}
        {activeTab === 'personal' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Pessoais</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <Input
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status da Conta
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isActive}
                      onChange={() => handleInputChange('isActive', true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Ativo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isActive}
                      onChange={() => handleInputChange('isActive', false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Inativo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dados de Acesso */}
        {activeTab === 'access' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Dados de Acesso</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função (Role) *
                </label>
                <div className="space-y-3">
                  {roleOptions.map(role => (
                    <div
                      key={role.value}
                      onClick={() => handleInputChange('role', role.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.role === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.role === role.value}
                          onChange={() => handleInputChange('role', role.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(mode === 'create' || formData.password) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha {mode === 'create' && '*'}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite a senha"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        error={errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Força da senha:</span>
                          <span className={`font-medium ${
                            passwordStrength <= 2 ? 'text-red-600' : 
                            passwordStrength <= 3 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha {mode === 'create' && '*'}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirme a senha"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Permissões Especiais */}
        {activeTab === 'permissions' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Permissões Especiais</h2>
            <div className="max-w-3xl">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    As permissões abaixo são adicionais ao role selecionado. Use com cuidado para não comprometer a segurança do sistema.
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionGroups).map(([group, permissions]) => (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      {group}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.permissions?.includes(permission.id) || false}
                            onChange={() => handlePermissionChange(permission.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm text-gray-700">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Configurações */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <Select
                  options={[
                    { value: 'pt-BR', label: 'Português (Brasil)' },
                    { value: 'en-US', label: 'English (US)' },
                    { value: 'es-ES', label: 'Español' }
                  ]}
                  value={formData.settings?.language || 'pt-BR'}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <Select
                  options={[
                    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
                    { value: 'America/New_York', label: 'New York (GMT-5)' },
                    { value: 'Europe/London', label: 'London (GMT)' }
                  ]}
                  value={formData.settings?.timezone || 'America/Sao_Paulo'}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings?.notifications || false}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Notificações por Email</div>
                    <div className="text-xs text-gray-500">Receber notificações importantes do sistema</div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings?.twoFactor || false}
                    onChange={(e) => handleSettingChange('twoFactor', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Autenticação em Dois Fatores</div>
                    <div className="text-xs text-gray-500">Adicionar uma camada extra de segurança</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer com Ações */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
};