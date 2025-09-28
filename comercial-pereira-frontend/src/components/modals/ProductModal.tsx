import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import { FormSelect } from '../forms/FormSelect'
import { FormCurrency } from '../forms/FormCurrency'
import { FormSwitch } from '../forms/FormSwitch'
import type {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../../types/dto/product.dto'
import productService from '../../services/api/product.service'
import categoryService from '../../services/api/category.service'
import supplierService from '../../services/api/supplier.service'


export const ProductModal: React.FC<{
  open: boolean
  onClose: () => void
  product?: ProductResponse | null
}> = ({
  open,
  onClose,
  product,
}) => {
  const queryClient = useQueryClient()
  const isEditMode = !!product
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      barcode: '',
      unitPrice: 0,
      costPrice: 0,
      categoryId: 0,
      supplierId: 0,
      unit: 'UN',
      isActive: true,
    },
  })
  
  // Queries para carregar categorias e fornecedores
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryService.getActiveCategories(),
  })
  
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers-active'],
    queryFn: () => supplierService.getActiveSuppliers(),
  })
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto criado com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao criar produto')
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => 
      productService.update(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto atualizado com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar produto')
    },
  })
  
  useEffect(() => {
    if (product) {
      reset(product)
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        barcode: '',
        unitPrice: 0,
        costPrice: 0,
        categoryId: 0,
        supplierId: 0,
        unit: 'UN',
        isActive: true,
      })
    }
  }, [product, reset])
  
  const handleClose = () => {
    reset()
    onClose()
  }
  
  const onSubmit = (data: any) => {
    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }
  
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))
  
  const supplierOptions = suppliers.map((sup) => ({
    value: sup.id,
    label: sup.name,
  }))
  
  const unitOptions = [
    { value: 'UN', label: 'Unidade' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'L', label: 'Litro' },
    { value: 'M', label: 'Metro' },
    { value: 'M2', label: 'Metro Quadrado' },
    { value: 'M3', label: 'Metro Cúbico' },
    { value: 'CX', label: 'Caixa' },
    { value: 'PC', label: 'Peça' },
  ]
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
              {isEditMode ? 'Editar Produto' : 'Novo Produto'}
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: '#64748B',
                '&:hover': {
                  backgroundColor: '#E2E8F0',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormTextField
                name="code"
                control={control}
                label="Código"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 8 }}>
              <FormTextField
                name="name"
                control={control}
                label="Nome do Produto"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormTextField
                name="description"
                control={control}
                label="Descrição"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                name="barcode"
                control={control}
                label="Código de Barras"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="unit"
                control={control}
                label="Unidade"
                options={unitOptions}
                emptyOption={false}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormCurrency
                name="costPrice"
                control={control}
                label="Preço de Custo"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormCurrency
                name="unitPrice"
                control={control}
                label="Preço de Venda"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="categoryId"
                control={control}
                label="Categoria"
                options={categoryOptions}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="supplierId"
                control={control}
                label="Fornecedor"
                options={supplierOptions}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormSwitch
                name="isActive"
                control={control}
                label="Produto Ativo"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#4F46E5',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#4F46E5',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <Button 
            onClick={handleClose}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748B',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#F1F5F9',
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
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
              },
              '&:disabled': {
                background: '#E2E8F0',
                boxShadow: 'none',
              },
            }}
          >
            {isEditMode ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}