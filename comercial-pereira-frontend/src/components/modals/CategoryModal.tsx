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
import { FormSwitch } from '../forms/FormSwitch'
import type {
  CreateCategoryRequest,
  CategoryResponse,
  UpdateCategoryRequest,
} from '../../types/dto/category.dto'
import categoryService from '../../services/api/category.service'

// Define a estrutura dos dados do formulário
interface CategoryFormData {
  name: string
  description: string
  cnae: string
  isActive: boolean
}

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  category?: CategoryResponse | null // Opcional, para modo de edição
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

  // Mutation para criar uma nova categoria
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

  // Mutation para atualizar uma categoria existente
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

  // Efeito para popular o formulário ao abrir em modo de edição
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
    reset() // Limpa o formulário ao fechar
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormTextField name="name" label="Nome da Categoria" control={control} required />
            <FormTextField name="description" label="Descrição" control={control} multiline rows={3} />
            <FormTextField name="cnae" label="CNAE (Opcional)" control={control} placeholder="Ex: 46.49-4-99" />
            
            {isEditMode && <FormSwitch name="isActive" label="Categoria ativa" control={control} />}
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
              : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}