import React, { useState } from "react";
import {
  Copy,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Users,
  Package,
  ShoppingCart,
  UserCircle,
  FileText,
  Settings,
  Layers,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface PermissionModule {
  id: string;
  name: string;
  icon: any;
  permissions: Permission[];
}

interface UserPermission {
  userId: number;
  userName: string;
  role: UserRole;
  permissions: string[];
}

interface UserPermissionMatrixProps {
  users: UserPermission[];
  modules?: PermissionModule[];
  onSave: (userId: number, permissions: string[]) => Promise<void>;
  onCopyPermissions?: (
    fromUserId: number,
    toUserIds: number[]
  ) => Promise<void>;
  onApplyTemplate?: (template: UserRole, userIds: number[]) => Promise<void>;
  loading?: boolean;
}

export const UserPermissionMatrix: React.FC<UserPermissionMatrixProps> = ({
  users,
  modules: customModules,
  onSave,
  onCopyPermissions,
  onApplyTemplate,
  loading = false,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<number, string[]>>(
    users.reduce(
      (acc, user) => ({
        ...acc,
        [user.userId]: user.permissions,
      }),
      {}
    )
  );
  const [copyFromUserId, setCopyFromUserId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<UserRole | "">("");
  const [modifiedUsers, setModifiedUsers] = useState<Set<number>>(new Set());

  const defaultModules: PermissionModule[] = customModules || [
    {
      id: "users",
      name: "Usuários",
      icon: Users,
      permissions: [
        {
          id: "users.view",
          name: "Visualizar",
          description: "Listar e visualizar usuários",
        },
        {
          id: "users.create",
          name: "Criar",
          description: "Criar novos usuários",
        },
        {
          id: "users.edit",
          name: "Editar",
          description: "Editar dados de usuários",
        },
        {
          id: "users.delete",
          name: "Excluir",
          description: "Excluir usuários",
        },
        {
          id: "users.permissions",
          name: "Gerenciar Permissões",
          description: "Alterar permissões de usuários",
        },
      ],
    },
    {
      id: "products",
      name: "Produtos",
      icon: Package,
      permissions: [
        {
          id: "products.view",
          name: "Visualizar",
          description: "Listar e visualizar produtos",
        },
        {
          id: "products.create",
          name: "Criar",
          description: "Cadastrar novos produtos",
        },
        {
          id: "products.edit",
          name: "Editar",
          description: "Editar informações de produtos",
        },
        {
          id: "products.delete",
          name: "Excluir",
          description: "Remover produtos",
        },
        {
          id: "products.import",
          name: "Importar",
          description: "Importar produtos em massa",
        },
        {
          id: "products.export",
          name: "Exportar",
          description: "Exportar lista de produtos",
        },
      ],
    },
    {
      id: "sales",
      name: "Vendas",
      icon: ShoppingCart,
      permissions: [
        {
          id: "sales.view",
          name: "Visualizar",
          description: "Ver vendas realizadas",
        },
        {
          id: "sales.create",
          name: "Criar",
          description: "Registrar novas vendas",
        },
        {
          id: "sales.edit",
          name: "Editar",
          description: "Modificar vendas existentes",
        },
        {
          id: "sales.cancel",
          name: "Cancelar",
          description: "Cancelar vendas",
        },
        {
          id: "sales.discount",
          name: "Aplicar Descontos",
          description: "Aplicar descontos especiais",
        },
        {
          id: "sales.approve",
          name: "Aprovar",
          description: "Aprovar vendas com condições especiais",
        },
      ],
    },
    {
      id: "customers",
      name: "Clientes",
      icon: UserCircle,
      permissions: [
        {
          id: "customers.view",
          name: "Visualizar",
          description: "Listar e visualizar clientes",
        },
        {
          id: "customers.create",
          name: "Criar",
          description: "Cadastrar novos clientes",
        },
        {
          id: "customers.edit",
          name: "Editar",
          description: "Editar dados de clientes",
        },
        {
          id: "customers.delete",
          name: "Excluir",
          description: "Remover clientes",
        },
        {
          id: "customers.credit",
          name: "Gerenciar Crédito",
          description: "Alterar limite de crédito",
        },
      ],
    },
    {
      id: "reports",
      name: "Relatórios",
      icon: FileText,
      permissions: [
        {
          id: "reports.view",
          name: "Visualizar",
          description: "Acessar relatórios",
        },
        {
          id: "reports.export",
          name: "Exportar",
          description: "Exportar relatórios",
        },
        {
          id: "reports.financial",
          name: "Financeiros",
          description: "Acessar relatórios financeiros",
        },
        {
          id: "reports.audit",
          name: "Auditoria",
          description: "Acessar logs de auditoria",
        },
      ],
    },
    {
      id: "settings",
      name: "Configurações",
      icon: Settings,
      permissions: [
        {
          id: "settings.view",
          name: "Visualizar",
          description: "Ver configurações",
        },
        {
          id: "settings.edit",
          name: "Editar",
          description: "Alterar configurações do sistema",
        },
        {
          id: "settings.backup",
          name: "Backup",
          description: "Realizar backup do sistema",
        },
        {
          id: "settings.integration",
          name: "Integrações",
          description: "Gerenciar integrações",
        },
      ],
    },
  ];

  const roleTemplates: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: defaultModules.flatMap((m) =>
      m.permissions.map((p) => p.id)
    ),
    [UserRole.MANAGER]: [
      "products.view",
      "products.create",
      "products.edit",
      "products.export",
      "sales.view",
      "sales.create",
      "sales.edit",
      "sales.approve",
      "customers.view",
      "customers.create",
      "customers.edit",
      "reports.view",
      "reports.export",
      "reports.financial",
    ],
    [UserRole.SALESPERSON]: [
      "products.view",
      "sales.view",
      "sales.create",
      "sales.edit",
      "customers.view",
      "customers.create",
      "customers.edit",
      "reports.view",
    ],
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const togglePermission = (userId: number, permissionId: string) => {
    setPermissions((prev) => ({
      ...prev,
      [userId]: prev[userId]?.includes(permissionId)
        ? prev[userId].filter((p) => p !== permissionId)
        : [...(prev[userId] || []), permissionId],
    }));
    setModifiedUsers((prev) => new Set([...prev, userId]));
  };

  const toggleAllPermissionsForModule = (
    userId: number,
    moduleId: string,
    modulePermissions: Permission[]
  ) => {
    const permissionIds = modulePermissions.map((p) => p.id);
    const userPermissions = permissions[userId] || [];
    const allSelected = permissionIds.every((id) =>
      userPermissions.includes(id)
    );

    setPermissions((prev) => ({
      ...prev,
      [userId]: allSelected
        ? prev[userId].filter((p) => !permissionIds.includes(p))
        : [...new Set([...(prev[userId] || []), ...permissionIds])],
    }));
    setModifiedUsers((prev) => new Set([...prev, userId]));
  };

  const handleSaveUser = async (userId: number) => {
    await onSave(userId, permissions[userId] || []);
    setModifiedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleSaveAll = async () => {
    for (const userId of Array.from(modifiedUsers)) {
      await onSave(userId, permissions[userId] || []);
    }
    setModifiedUsers(new Set());
  };

  const handleCopyPermissions = async () => {
    if (!copyFromUserId || selectedUsers.length === 0) return;

    const sourcePermissions = permissions[copyFromUserId] || [];
    selectedUsers.forEach((userId) => {
      setPermissions((prev) => ({
        ...prev,
        [userId]: [...sourcePermissions],
      }));
      setModifiedUsers((prev) => new Set([...prev, userId]));
    });

    if (onCopyPermissions) {
      await onCopyPermissions(copyFromUserId, selectedUsers);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || selectedUsers.length === 0) return;

    const templatePermissions = roleTemplates[selectedTemplate as UserRole];
    selectedUsers.forEach((userId) => {
      setPermissions((prev) => ({
        ...prev,
        [userId]: [...templatePermissions],
      }));
      setModifiedUsers((prev) => new Set([...prev, userId]));
    });

    if (onApplyTemplate) {
      await onApplyTemplate(selectedTemplate as UserRole, selectedUsers);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((u) => u.userId));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header com ações em massa */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Matriz de Permissões
          </h3>
          {modifiedUsers.size > 0 && (
            <Button onClick={handleSaveAll} disabled={loading} leftIcon={Save}>
              Salvar Todas as Alterações ({modifiedUsers.size})
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Ações em Massa:</strong> Selecione usuários e aplique
              permissões ou templates predefinidos.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Copy Permissions */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Copiar permissões de:
              </label>
              <div className="flex space-x-2">
                <Select
                  options={[
                    { value: "", label: "Selecione um usuário" },
                    ...users.map((u) => ({
                      value: u.userId.toString(),
                      label: u.userName,
                    })),
                  ]}
                  value={copyFromUserId?.toString() || ""}
                  onValueChange={(value) =>
                    setCopyFromUserId(Number(value) || null)
                  }
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyPermissions}
                  disabled={!copyFromUserId || selectedUsers.length === 0}
                  leftIcon={Copy}
                >
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Apply Template */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Aplicar template de role:
              </label>
              <div className="flex space-x-2">
                <Select
                  options={[
                    { value: "", label: "Selecione um template" },
                    { value: UserRole.ADMIN, label: "Template Admin" },
                    { value: UserRole.MANAGER, label: "Template Gerente" },
                    { value: UserRole.SALESPERSON, label: "Template Vendedor" },
                  ]}
                  value={selectedTemplate}
                  onValueChange={(value) =>
                    setSelectedTemplate(value as UserRole)
                  }
                  className="flex-1"
                />

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate || selectedUsers.length === 0}
                  leftIcon={Layers}
                >
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Selection Info */}
            <div className="flex items-end justify-between">
              <div className="text-sm">
                <span className="text-gray-600">Selecionados: </span>
                <span className="font-medium text-gray-900">
                  {selectedUsers.length} usuários
                </span>
              </div>
              <div className="space-x-2">
                <Button size="sm" variant="secondary" onClick={selectAllUsers}>
                  Selecionar Todos
                </Button>
                <Button size="sm" variant="secondary" onClick={clearSelection}>
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de Permissões */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={() =>
                    selectedUsers.length === users.length
                      ? clearSelection()
                      : selectAllUsers()
                  }
                  className="rounded border-gray-300"
                />
              </th>
              <th className="sticky left-12 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Módulo / Permissão
              </th>
              {users.map((user) => (
                <th
                  key={user.userId}
                  className="px-4 py-3 text-center min-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-900">
                      {user.userName}
                    </span>
                    <span className="text-xs text-gray-500">{user.role}</span>
                    {modifiedUsers.has(user.userId) && (
                      <span
                        className="mt-1 inline-block w-2 h-2 bg-orange-400 rounded-full"
                        title="Modificado"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {defaultModules.map((module) => (
              <React.Fragment key={module.id}>
                {/* Linha do Módulo */}
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="sticky left-0 z-10 bg-gray-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(users[0]?.userId)}
                      onChange={() => toggleUserSelection(users[0]?.userId)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="sticky left-12 z-10 bg-gray-50 px-4 py-3">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <module.icon className="w-4 h-4" />
                      <span>{module.name}</span>
                    </button>
                  </td>
                  {users.map((user) => {
                    const userPermissions = permissions[user.userId] || [];
                    const modulePermissionIds = module.permissions.map(
                      (p) => p.id
                    );
                    const checkedCount = modulePermissionIds.filter((id) =>
                      userPermissions.includes(id)
                    ).length;
                    const isPartial =
                      checkedCount > 0 &&
                      checkedCount < modulePermissionIds.length;
                    const isComplete =
                      checkedCount === modulePermissionIds.length;

                    return (
                      <td key={user.userId} className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            toggleAllPermissionsForModule(
                              user.userId,
                              module.id,
                              module.permissions
                            )
                          }
                          className={`
                            inline-flex items-center justify-center w-6 h-6 rounded
                            ${isComplete ? "bg-blue-600 text-white" : isPartial ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-400"}
                            hover:bg-blue-500 hover:text-white transition-colors
                          `}
                        >
                          {isComplete ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : isPartial ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>

                {/* Linhas das Permissões (expandível) */}
                {expandedModules.includes(module.id) &&
                  module.permissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2"></td>
                      <td className="sticky left-12 z-10 bg-white px-4 py-2 pl-12">
                        <div>
                          <span className="text-sm text-gray-700">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <p className="text-xs text-gray-500">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </td>
                      {users.map((user) => (
                        <td key={user.userId} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              permissions[user.userId]?.includes(
                                permission.id
                              ) || false
                            }
                            onChange={() =>
                              togglePermission(user.userId, permission.id)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer com ações individuais */}
      {modifiedUsers.size > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {modifiedUsers.size} usuário(s) com alterações pendentes
            </p>
            <div className="space-x-2">
              {Array.from(modifiedUsers).map((userId) => {
                const user = users.find((u) => u.userId === userId);
                return (
                  <Button
                    key={userId}
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSaveUser(userId)}
                  >
                    Salvar {user?.userName}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
