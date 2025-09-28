import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
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
import categoryService from '../../services/category.service'
import supplierService from '../../services/supplier.service'
import productService from '../../services/api/product.service'



const productSchema = yup.object({
  code: yup.string().required('Código é obrigatório'),
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string(),
  barcode: yup.string(),
  unitPrice: yup.number().required('Preço é obrigatório').min(0.01),
  costPrice: yup.number().min(0),
  categoryId: yup.number().required('Categoria é obrigatória'),
  supplierId: yup.number().required('Fornecedor é obrigatório'),
  unit: yup.string().required('Unidade é obrigatória'),
  isActive: yup.boolean(),
})

interface ProductModalProps {
  open: boolean
  onClose: () => void
  product?: ProductResponse | null
}

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  product,
}) => {
  const queryClient = useQueryClient()
  const isEditMode = !!product
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(productSchema),
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isEditMode ? 'Editar Produto' : 'Novo Produto'}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormTextField
                name="code"
                control={control}
                label="Código"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <FormTextField
                name="name"
                control={control}
                label="Nome do Produto"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextField
                name="description"
                control={control}
                label="Descrição"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="barcode"
                control={control}
                label="Código de Barras"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSelect
                name="unit"
                control={control}
                label="Unidade"
                options={unitOptions}
                emptyOption={false}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormCurrency
                name="costPrice"
                control={control}
                label="Preço de Custo"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormCurrency
                name="unitPrice"
                control={control}
                label="Preço de Venda"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSelect
                name="categoryId"
                control={control}
                label="Categoria"
                options={categoryOptions}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSelect
                name="supplierId"
                control={control}
                label="Fornecedor"
                options={supplierOptions}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormSwitch
                name="isActive"
                control={control}
                label="Produto Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditMode ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}