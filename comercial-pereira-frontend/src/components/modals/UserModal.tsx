import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import { FormSelect } from '../forms/FormSelect'
import { FormSwitch } from '../forms/FormSwitch'
import type {
  CreateUserRequest,
  UserResponse,
  UpdateUserRequest,
} from '../../types/dto/user.dto'
import { UserRole } from '../../types/enums'
import userService from '../../services/api/user.service'

interface UserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
  isActive: boolean
}

interface UserModalProps {
  open: boolean
  onClose: () => void
  user?: UserResponse | null
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient()
  const isEditMode = !!user
  
  const { control, handleSubmit, reset } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.SALESPERSON,
      isActive: true,
    },
  })
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-stats'] })
      toast.success('Usuário criado com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao criar usuário')
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => 
      userService.update(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-stats'] })
      toast.success('Usuário atualizado com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar usuário')
    },
  })
  
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive,
      })
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        role: UserRole.SALESPERSON,
        isActive: true,
      })
    }
  }, [user, reset])
  
  const handleClose = () => {
    reset()
    onClose()
  }
  
  const onSubmit = (data: UserFormData) => {
    if (isEditMode) {
      // Remove password from update data if it's empty
      const updateData = { ...data }
      if (!updateData.password) {
        delete (updateData as Record<string, unknown>).password
      }
      updateMutation.mutate(updateData as UpdateUserRequest)
    } else {
      const createData: CreateUserRequest = { ...data, password: data.password || '' }
      createMutation.mutate(createData)
    }
  }
  
  const roleOptions = [
    { value: UserRole.ADMIN, label: 'Administrador' },
    { value: UserRole.MANAGER, label: 'Gerente' },
    { value: UserRole.SALESPERSON, label: 'Vendedor' },
  ]
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(59, 130, 246, 0.15)',
          background: 'white',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: '1px solid #E3F2FD',
          backgroundColor: '#FAFBFF',
          position: 'relative',
          p: 3,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            color: '#1E293B',
            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
        <IconButton 
          onClick={handleClose} 
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#64748B',
            '&:hover': {
              backgroundColor: '#EBF8FF',
              color: '#3B82F6',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3, backgroundColor: 'white' }}>
          <Stack spacing={3}>
            <FormTextField
              name="name"
              label="Nome"
              control={control}
            />
            
            <FormTextField
              name="email"
              label="Email"
              type="email"
              control={control}
            />
            
            {!isEditMode && (
              <FormTextField
                name="password"
                label="Senha"
                type="password"
                control={control}
              />
            )}
            
            <FormSelect
              name="role"
              label="Perfil"
              control={control}
              options={roleOptions}
              emptyOption={false}
            />
            
            {isEditMode && (
              <FormSwitch
                name="isActive"
                label="Usuário ativo"
                control={control}
              />
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 3, 
            borderTop: '1px solid #E3F2FD', 
            backgroundColor: '#FAFBFF',
            gap: 2,
          }}
        >
          <Button 
            onClick={handleClose} 
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748B',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              border: '2px solid #E2E8F0',
              '&:hover': {
                backgroundColor: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#475569',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: '#E2E8F0',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Salvando...'
              : isEditMode
              ? 'Atualizar'
              : 'Criar'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
