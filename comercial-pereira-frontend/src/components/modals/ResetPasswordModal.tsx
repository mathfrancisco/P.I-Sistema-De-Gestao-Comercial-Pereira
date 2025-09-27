import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import type { UserResponse, ResetPasswordRequest } from '../../types/dto/user.dto'
import userService from '../../services/api/user.service'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

interface ResetPasswordModalProps {
  open: boolean
  onClose: () => void
  user: UserResponse
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient()
  
  const { control, handleSubmit, reset, watch } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')
  
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => 
      userService.resetPassword(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Senha resetada com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao resetar senha')
    },
  })
  
  const handleClose = () => {
    reset()
    onClose()
  }
  
  const onSubmit = (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    
    if (data.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    resetPasswordMutation.mutate({ password: data.password })
  }
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Resetar Senha
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Você está resetando a senha do usuário: <strong>{user.name}</strong> ({user.email})
          </Typography>
          
          <FormTextField
            name="password"
            label="Nova Senha"
            type="password"
            control={control}
            sx={{ mb: 2 }}
          />
          
          <FormTextField
            name="confirmPassword"
            label="Confirmar Nova Senha"
            type="password"
            control={control}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={resetPasswordMutation.isPending || !password}
          >
            {resetPasswordMutation.isPending ? 'Resetando...' : 'Resetar Senha'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}