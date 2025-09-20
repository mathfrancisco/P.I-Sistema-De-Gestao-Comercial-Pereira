'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';
import { 
  UserResponse, 
  CreateUserInput, 
  UpdateUserInput 
} from '@/lib/validations/users';
import { UserForm } from '@/components/users/UserForm';

export default function UserFormPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const isEditMode = !!userId;
  
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(isEditMode);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Buscar dados do usuário para edição
  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [isEditMode, userId]);

  const fetchUser = async () => {
    try {
      setFetchingUser(true);
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      
      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário');
      console.error(error);
      router.push('/users');
    } finally {
      setFetchingUser(false);
    }
  };

  const handleSubmit = async (formData: CreateUserInput | UpdateUserInput) => {
    try {
      setLoading(true);
      
      const url = isEditMode 
        ? `/api/users/${userId}` 
        : '/api/users';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar usuário');
      }
      
      toast.success(
        isEditMode 
          ? 'Usuário atualizado com sucesso!' 
          : 'Usuário criado com sucesso!'
      );
      
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
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
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={handleCancel}
            >
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <UserForm
            user={user || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            mode={isEditMode ? 'edit' : 'create'}
          />
        </div>
      </div>
    </div>
  );
}