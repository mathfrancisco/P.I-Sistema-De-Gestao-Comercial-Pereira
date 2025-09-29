import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
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
          Resetar Senha
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
          <Box 
            sx={{
              p: 3,
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E3F2FD',
              mb: 3,
            }}
          >
            <Typography variant="body1" sx={{ color: '#64748B', mb: 1 }}>
              Você está resetando a senha do usuário:
            </Typography>
            <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {user.email}
            </Typography>
          </Box>
          
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
            disabled={resetPasswordMutation.isPending || !password}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
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
            {resetPasswordMutation.isPending ? 'Resetando...' : 'Resetar Senha'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}