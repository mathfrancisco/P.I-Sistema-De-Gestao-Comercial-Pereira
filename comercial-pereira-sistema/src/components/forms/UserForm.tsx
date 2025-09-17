import {UserResponse} from "@/types";
import {CreateUserInput, UpdateUserInput} from "@/lib/validations/users";
import React, {useState} from "react";
import {UserRole} from "@prisma/client";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {Button} from "@/components/ui/button";


interface UserFormProps {
    user?: UserResponse | null;
    onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
    onCancel: () => void;
    loading?: boolean;
    mode: 'create' | 'edit';
}

export const UserForm: React.FC<UserFormProps> = ({
                                                      user,
                                                      onSubmit,
                                                      onCancel,
                                                      loading = false,
                                                      mode
                                                  }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        role: user?.role || 'SALESPERSON' as UserRole,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Nome
        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.name)) {
            newErrors.name = 'Nome deve conter apenas letras e espaços';
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Senha (apenas no create)
        if (mode === 'create') {
            if (!formData.password) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
            } else if (!/(?=.*[a-z])/.test(formData.password)) {
                newErrors.password = 'Senha deve conter pelo menos uma letra minúscula';
            } else if (!/(?=.*[A-Z])/.test(formData.password)) {
                newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula';
            } else if (!/(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Senha deve conter pelo menos um número';
            } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
                newErrors.password = 'Senha deve conter pelo menos um caractere especial (@$!%*?&)';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Senhas não coincidem';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const submitData = mode === 'create'
            ? {
                name: formData.name,
                email: formData.email.toLowerCase(),
                password: formData.password,
                role: formData.role,
            }
            : {
                name: formData.name,
                email: formData.email.toLowerCase(),
                role: formData.role,
            };

        onSubmit(submitData);
    };

    const roleOptions = [
        { value: 'SALESPERSON', label: 'Vendedor' },
        { value: 'MANAGER', label: 'Gerente' },
        { value: 'ADMIN', label: 'Administrador' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                </h2>
                <p className="text-gray-600 mt-2">
                    {mode === 'create'
                        ? 'Preencha os dados para criar um novo usuário no sistema'
                        : 'Atualize as informações do usuário'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Nome completo"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        error={errors.name}
                        placeholder="Digite o nome completo"
                    />

                    <Input
                        label="Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        error={errors.email}
                        placeholder="exemplo@comercialpereira.com"
                    />

                    {mode === 'create' && (
                        <>
                            <Input
                                label="Senha"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e: { target: { value: any; }; }) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                error={errors.password}
                                placeholder="Digite a senha"
                                helpText="Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial"
                            />

                            <Input
                                label="Confirmar senha"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e: { target: { value: any; }; }) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                error={errors.confirmPassword}
                                placeholder="Confirme a senha"
                            />
                        </>
                    )}

                    <Select
                        label="Role do usuário"
                        required
                        options={roleOptions}
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={loading}>
                        {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </div>
    );
};