import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import type { InventoryResponse, StockAdjustmentRequest } from '../../types/dto/inventory.dto'
import inventoryService from '../../services/api/inventory.service'

interface StockAdjustmentModalProps {
  open: boolean
  onClose: () => void
  inventory: InventoryResponse
}

interface FormData {
  type: 'ADD' | 'REMOVE' | 'SET'
  quantity: number
  reason: string
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  open,
  onClose,
  inventory,
}) => {
  const queryClient = useQueryClient()
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'ADD',
      quantity: 0,
      reason: '',
    },
  })
  
  const adjustmentType = watch('type')
  
  const mutation = useMutation({
    mutationFn: (data: StockAdjustmentRequest) => 
      inventoryService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Estoque ajustado com sucesso')
      handleClose()
    },
    onError: () => {
      toast.error('Erro ao ajustar estoque')
    },
  })
  
  const handleClose = () => {
    reset()
    onClose()
  }
  
  const onSubmit = (data: FormData) => {
    mutation.mutate({
      productId: inventory.productId,
      ...data,
    })
  }
  
  const getNewQuantity = (quantity: number, type: string) => {
    switch (type) {
      case 'ADD':
        return inventory.currentQuantity + quantity
      case 'REMOVE':
        return inventory.currentQuantity - quantity
      case 'SET':
        return quantity
      default:
        return inventory.currentQuantity
    }
  }
  
  const quantity = watch('quantity', 0)
  const newQuantity = getNewQuantity(quantity, adjustmentType)
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Ajustar Estoque</DialogTitle>
        
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Produto
            </Typography>
            <Typography variant="body1">
              {inventory.productName} - {inventory.productCode}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Estoque Atual
            </Typography>
            <Typography variant="h5" color="primary">
              {inventory.currentQuantity} unidades
            </Typography>
          </Box>
          
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Tipo de Ajuste</FormLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value="ADD"
                    control={<Radio />}
                    label="Adicionar"
                  />
                  <FormControlLabel
                    value="REMOVE"
                    control={<Radio />}
                    label="Remover"
                  />
                  <FormControlLabel
                    value="SET"
                    control={<Radio />}
                    label="Definir"
                  />
                </RadioGroup>
              )}
            />
          </FormControl>
          
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: 'Quantidade é obrigatória',
              min: {
                value: adjustmentType === 'SET' ? 0 : 1,
                message: 'Quantidade deve ser maior que zero',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label={
                  adjustmentType === 'SET'
                    ? 'Nova Quantidade'
                    : 'Quantidade a ' + (adjustmentType === 'ADD' ? 'Adicionar' : 'Remover')
                }
                fullWidth
                margin="normal"
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
              />
            )}
          />
          
          <Controller
            name="reason"
            control={control}
            rules={{ required: 'Motivo é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Motivo do Ajuste"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                error={!!errors.reason}
                helperText={errors.reason?.message}
              />
            )}
          />
          
          {quantity > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Novo estoque será: <strong>{newQuantity} unidades</strong>
            </Alert>
          )}
          
          {adjustmentType === 'REMOVE' && newQuantity < 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Estoque não pode ficar negativo!
            </Alert>
          )}
          
          {newQuantity < (inventory.minQuantity || 0) && newQuantity >= 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Estoque ficará abaixo do mínimo!
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || newQuantity < 0}
          >
            Ajustar Estoque
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}