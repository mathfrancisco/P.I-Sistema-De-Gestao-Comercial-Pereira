import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import { FormSwitch } from '../forms/FormSwitch'
import { FormSelect } from '../forms/FormSelect' 
import type {
  CreateSupplierRequest,
  SupplierResponse,
  UpdateSupplierRequest,
} from '../../types/dto/supplier.dto'
import supplierService from '../../services/api/supplier.service'

// Define a estrutura dos dados do formulário
interface SupplierFormData {
  name: string
  contactPerson: string
  email: string
  phone: string
  cnpj: string
  website: string
  address: string
  city: string
  state: string
  zipCode: string
  notes: string
  isActive: boolean
}

interface SupplierModalProps {
  open: boolean
  onClose: () => void
  supplier?: SupplierResponse | null
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onClose,
  supplier,
}) => {
  const queryClient = useQueryClient()
  const isEditMode = !!supplier

  const { control, handleSubmit, reset } = useForm<SupplierFormData>({
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      cnpj: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      isActive: true,
    },
  })
  
  // Busca a lista de estados para o dropdown
  const { data: states = [] } = useQuery({
    queryKey: ['brazilian-states'],
    queryFn: () => supplierService.getAvailableStates(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] })
      toast.success('Fornecedor criado com sucesso')
      handleClose()
    },
    onError: (error) => toast.error(error.message || 'Erro ao criar fornecedor'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSupplierRequest) =>
      supplierService.update(supplier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] })
      toast.success('Fornecedor atualizado com sucesso')
      handleClose()
    },
    onError: (error) => toast.error(error.message || 'Erro ao atualizar fornecedor'),
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        cnpj: supplier.cnpj || '',
        website: supplier.website || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zipCode: supplier.zipCode || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive,
      })
    } else {
      reset({
        name: '', contactPerson: '', email: '', phone: '', cnpj: '',
        website: '', address: '', city: '', state: '', zipCode: '',
        notes: '', isActive: true,
      })
    }
  }, [supplier, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: SupplierFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditMode ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Informações Principais */}
            <Grid item xs={12} sm={8}> <FormTextField name="name" label="Nome / Razão Social" control={control} required /> </Grid>
            <Grid item xs={12} sm={4}> <FormTextField name="cnpj" label="CNPJ" control={control} /> </Grid>
            <Grid item xs={12} sm={6}> <FormTextField name="contactPerson" label="Pessoa de Contato" control={control} /> </Grid>
            <Grid item xs={12} sm={6}> <FormTextField name="email" label="Email" type="email" control={control} /> </Grid>
            <Grid item xs={12} sm={6}> <FormTextField name="phone" label="Telefone" control={control} /> </Grid>
            <Grid item xs={12} sm={6}> <FormTextField name="website" label="Website" control={control} /> </Grid>
            
            {/* Endereço */}
            <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Endereço</Typography></Grid>
            <Grid item xs={12} sm={9}> <FormTextField name="address" label="Endereço" control={control} /> </Grid>
            <Grid item xs={12} sm={3}> <FormTextField name="zipCode" label="CEP" control={control} /> </Grid>
            <Grid item xs={12} sm={6}> <FormTextField name="city" label="Cidade" control={control} /> </Grid>
            <Grid item xs={12} sm={6}>
              <FormSelect name="state" label="Estado" control={control} emptyOption>
                {states.map((state) => ( <MenuItem key={state} value={state}>{state}</MenuItem> ))}
              </FormSelect>
            </Grid>
            
            {/* Outras Informações */}
            <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Outras Informações</Typography></Grid>
            <Grid item xs={12}> <FormTextField name="notes" label="Observações" control={control} multiline rows={3} /> </Grid>
            {isEditMode && ( <Grid item xs={12}> <FormSwitch name="isActive" label="Fornecedor Ativo" control={control} /> </Grid> )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}