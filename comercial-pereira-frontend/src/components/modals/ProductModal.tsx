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
            price: 0,
            categoryId: 0,
            supplierId: 0,
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
            reset({
                code: product.code,
                name: product.name,
                description: product.description,
                barcode: product.barcode,
                price: product.price,
                categoryId: product.category.id,  // ← Acessa o id do objeto
                supplierId: product.supplier.id,  // ← Acessa o id do objeto
                isActive: product.isActive,
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
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(59, 130, 246, 0.15)',
          background: 'white',
          overflow: 'hidden',
        }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            borderBottom: '1px solid #E3F2FD',
            backgroundColor: '#FAFBFF',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              {isEditMode ? 'Editar Produto' : 'Novo Produto'}
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: '#64748B',
                '&:hover': {
                  backgroundColor: '#EBF8FF',
                  color: '#3B82F6',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, backgroundColor: 'white' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormTextField
                name="code"
                control={control}
                label="Código"
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 8 }}>
              <FormTextField
                name="name"
                control={control}
                label="Nome do Produto"
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormTextField
                name="description"
                control={control}
                label="Descrição"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                name="barcode"
                control={control}
                label="Código de Barras"
              />
            </Grid>

              <FormCurrency
                  name="price"    
                  control={control}
                  label="Preço de Venda"
                  required
              />
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="categoryId"
                control={control}
                label="Categoria"
                options={categoryOptions}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="supplierId"
                control={control}
                label="Fornecedor"
                options={supplierOptions}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormSwitch
                name="isActive"
                control={control}
                label="Produto Ativo"
              />
            </Grid>
          </Grid>
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
            {isEditMode ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}