import React from 'react';
import { UserResponse, UserRole } from '@/lib/validations/users';
import { 
  Crown, Shield, UserCheck, Edit, Key, UserX, 
  Clock, MoreVertical, Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserListCardProps {
  user: UserResponse;
  onEdit: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onViewDetails: (user: UserResponse) => void;
  selected?: boolean;
  onSelect?: (user: UserResponse) => void;
  lastLogin?: Date;
  isOnline?: boolean;
}

export const UserListCard: React.FC<UserListCardProps> = ({
  user,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onViewDetails,
  selected = false,
  onSelect,
  lastLogin = new Date(),
  isOnline = false
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getRoleConfig = (role: UserRole) => {
    const configs = {
      ADMIN: {
        label: 'Administrador',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Crown
      },
      MANAGER: {
        label: 'Gerente',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Shield
      },
      SALESPERSON: {
        label: 'Vendedor',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: UserCheck
      }
    };
    return configs[role];
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className={`
      bg-white rounded-xl border transition-all duration-200 hover:shadow-md
      ${selected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Avatar and User Info */}
          <div className="flex items-center space-x-4">
            {/* Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(user)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            )}

            {/* Avatar - 60px as specified */}
            <div className="relative">
              <div className="w-[60px] h-[60px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {getInitials(user.name)}
              </div>
              {/* Online/Offline Status Indicator */}
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>

            {/* User Info - Nome e email empilhados */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h3>
                {/* Role badge colorido */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleConfig.color}`}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleConfig.label}
                </span>
                {/* Status indicator */}
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <Circle className={`w-2 h-2 mr-1 fill-current`} />
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{user.email}</p>
              
              {/* Last login timestamp */}
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Último login {formatDistanceToNow(lastLogin, { locale: ptBR, addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Actions - edit, reset password, toggle status */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onViewDetails(user)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Ver detalhes"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onResetPassword(user)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
              title="Resetar senha"
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
              <UserX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};