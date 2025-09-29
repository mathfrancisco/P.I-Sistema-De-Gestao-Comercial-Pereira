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
  Box,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import { FormSwitch } from '../forms/FormSwitch'
import type {
  CreateCategoryRequest,
  CategoryResponse,
  UpdateCategoryRequest,
} from '../../types/dto/category.dto'
import categoryService from '../../services/api/category.service'

interface CategoryFormData {
  name: string
  description: string
  cnae: string
  isActive: boolean
}

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  category?: CategoryResponse | null
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  category,
}) => {
  const queryClient = useQueryClient()
  const isEditMode = !!category

  const { control, handleSubmit, reset } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      cnae: '',
      isActive: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-stats'] })
      toast.success('Categoria criada com sucesso')
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar categoria')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      categoryService.update(category!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-stats'] })
      toast.success('Categoria atualizada com sucesso')
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar categoria')
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        cnae: category.cnae || '',
        isActive: category.isActive,
      })
    } else {
      reset({
        name: '',
        description: '',
        cnae: '',
        isActive: true,
      })
    }
  }, [category, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: CategoryFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
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
          {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
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
          <Stack spacing={3} sx={{ pt: 1 }}>
            <FormTextField 
              name="name" 
              label="Nome da Categoria" 
              control={control} 
              required 
            />
            <FormTextField 
              name="description" 
              label="Descrição" 
              control={control} 
              multiline 
              rows={3} 
            />
            <FormTextField 
              name="cnae" 
              label="CNAE (Opcional)" 
              control={control} 
              placeholder="Ex: 46.49-4-99" 
            />
            
            {isEditMode && (
              <FormSwitch 
                name="isActive" 
                label="Categoria ativa" 
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
              : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
