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
    IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
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
            productId: inventory.product.id,
            ...data,
        })
    }

    const getNewQuantity = (quantity: number, type: string) => {
        switch (type) {
            case 'ADD':
                return inventory.quantity + quantity
            case 'REMOVE':
                return inventory.quantity - quantity
            case 'SET':
                return quantity
            default:
                return inventory.quantity
        }
    }

    const quantity = watch('quantity', 0)
    const newQuantity = getNewQuantity(quantity, adjustmentType)

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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                        Ajustar Estoque
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
                        <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1 }}>
                            Produto
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            {inventory.product.name} - {inventory.product.code}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ color: '#64748B', mt: 2, mb: 1 }}>
                            Estoque Atual
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#3B82F6',
                                fontWeight: 700,
                            }}
                        >
                            {inventory.quantity} unidades
                        </Typography>
                    </Box>

                    <FormControl component="fieldset" margin="normal" sx={{ width: '100%' }}>
                        <FormLabel
                            component="legend"
                            sx={{
                                color: '#1E293B',
                                fontWeight: 600,
                                '&.Mui-focused': {
                                    color: '#3B82F6',
                                },
                            }}
                        >
                            Tipo de Ajuste
                        </FormLabel>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup {...field} row sx={{ mt: 1 }}>
                                    <FormControlLabel
                                        value="ADD"
                                        control={
                                            <Radio
                                                sx={{
                                                    color: '#94A3B8',
                                                    '&.Mui-checked': {
                                                        color: '#3B82F6',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                                                Adicionar
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        value="REMOVE"
                                        control={
                                            <Radio
                                                sx={{
                                                    color: '#94A3B8',
                                                    '&.Mui-checked': {
                                                        color: '#3B82F6',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                                                Remover
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        value="SET"
                                        control={
                                            <Radio
                                                sx={{
                                                    color: '#94A3B8',
                                                    '&.Mui-checked': {
                                                        color: '#3B82F6',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                                                Definir
                                            </Typography>
                                        }
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#F8FAFC',
                                        '& fieldset': {
                                            borderColor: '#E3F2FD',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#93C5FD',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#3B82F6',
                                            borderWidth: '2px',
                                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                        },
                                        '&.Mui-error fieldset': {
                                            borderColor: '#EF4444',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#64748B',
                                        fontWeight: 500,
                                        '&.Mui-focused': {
                                            color: '#3B82F6',
                                        },
                                        '&.Mui-error': {
                                            color: '#EF4444',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#1E293B',
                                        fontWeight: 500,
                                    },
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                        fontWeight: 500,
                                    },
                                }}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#F8FAFC',
                                        '& fieldset': {
                                            borderColor: '#E3F2FD',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#93C5FD',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#3B82F6',
                                            borderWidth: '2px',
                                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                        },
                                        '&.Mui-error fieldset': {
                                            borderColor: '#EF4444',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#64748B',
                                        fontWeight: 500,
                                        '&.Mui-focused': {
                                            color: '#3B82F6',
                                        },
                                        '&.Mui-error': {
                                            color: '#EF4444',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#1E293B',
                                        fontWeight: 500,
                                    },
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                        fontWeight: 500,
                                    },
                                }}
                            />
                        )}
                    />

                    {quantity > 0 && (
                        <Alert
                            severity="info"
                            sx={{
                                mt: 2,
                                borderRadius: '12px',
                                backgroundColor: '#EBF8FF',
                                border: '1px solid #93C5FD',
                                '& .MuiAlert-icon': {
                                    color: '#3B82F6',
                                },
                                '& .MuiAlert-message': {
                                    color: '#1E40AF',
                                    fontWeight: 500,
                                },
                            }}
                        >
                            Novo estoque será: <strong>{newQuantity} unidades</strong>
                        </Alert>
                    )}

                    {adjustmentType === 'REMOVE' && newQuantity < 0 && (
                        <Alert
                            severity="error"
                            sx={{
                                mt: 2,
                                borderRadius: '12px',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                '& .MuiAlert-icon': {
                                    color: '#EF4444',
                                },
                                '& .MuiAlert-message': {
                                    color: '#991B1B',
                                    fontWeight: 500,
                                },
                            }}
                        >
                            Estoque não pode ficar negativo!
                        </Alert>
                    )}

                    {newQuantity < (inventory.minStock || 0) && newQuantity >= 0 && (
                        <Alert
                            severity="warning"
                            sx={{
                                mt: 2,
                                borderRadius: '12px',
                                backgroundColor: '#FFFBEB',
                                border: '1px solid #FCD34D',
                                '& .MuiAlert-icon': {
                                    color: '#F59E0B',
                                },
                                '& .MuiAlert-message': {
                                    color: '#92400E',
                                    fontWeight: 500,
                                },
                            }}
                        >
                            Estoque ficará abaixo do mínimo!
                        </Alert>
                    )}
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
                        disabled={mutation.isPending || newQuantity < 0}
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
                        Ajustar Estoque
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}