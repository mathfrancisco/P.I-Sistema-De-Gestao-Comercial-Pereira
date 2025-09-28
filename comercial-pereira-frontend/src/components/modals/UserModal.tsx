import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
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
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
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
        
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
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