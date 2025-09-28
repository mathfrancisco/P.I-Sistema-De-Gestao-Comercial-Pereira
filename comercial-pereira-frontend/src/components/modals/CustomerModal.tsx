import React, { useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FormTextField } from '../forms/FormTextField'
import { FormSwitch } from '../forms/FormSwitch'
import type {
    CreateCustomerRequest,
    CustomerResponse,
    UpdateCustomerRequest,
} from '../../types/dto/customer.dto'
import { CustomerType } from '../../types/enums'
import customerService from '../../services/api/customer.service'

const customerSchema = yup.object({
    name: yup.string().required('Nome é obrigatório'),
    email: yup.string().email('Email inválido'),
    phone: yup.string(),
    document: yup.string(),
    type: yup.string().required('Tipo de cliente é obrigatório'),
    address: yup.string(),
    city: yup.string(),
    state: yup.string(),
    zipCode: yup.string(),
    neighborhood: yup.string(),
    isActive: yup.boolean(),
})

interface CustomerModalProps {
    open: boolean
    onClose: () => void
    customer?: CustomerResponse | null
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
                                                                open,
                                                                onClose,
                                                                customer,
                                                            }) => {
    const queryClient = useQueryClient()
    const isEditMode = !!customer

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(customerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            document: '',
            type: CustomerType.FISICA,
            address: '',
            city: '',
            state: '',
            zipCode: '',
            neighborhood: '',
            isActive: true,
        },
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: CreateCustomerRequest) => customerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            toast.success('Cliente criado com sucesso')
            handleClose()
        },
        onError: () => {
            toast.error('Erro ao criar cliente')
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: UpdateCustomerRequest) =>
            customerService.update(customer!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            toast.success('Cliente atualizado com sucesso')
            handleClose()
        },
        onError: () => {
            toast.error('Erro ao atualizar cliente')
        },
    })

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                document: customer.document || '',
                type: customer.type,
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                zipCode: customer.zipCode || '',
                neighborhood: customer.neighborhood || '',
                isActive: customer.isActive,
            })
        } else {
            reset({
                name: '',
                email: '',
                phone: '',
                document: '',
                type: CustomerType.FISICA,
                address: '',
                city: '',
                state: '',
                zipCode: '',
                neighborhood: '',
                isActive: true,
            })
        }
    }, [customer, reset])

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

    const brazilStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <FormTextField
                                name="name"
                                control={control}
                                label="Nome Completo"
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Cliente</InputLabel>
                                <Select
                                    name="type"
                                    value={control._defaultValues.type}
                                    label="Tipo de Cliente"
                                >
                                    <MenuItem value={CustomerType.FISICA}>Pessoa Física</MenuItem>
                                    <MenuItem value={CustomerType.JURIDICA}>Pessoa Jurídica</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormTextField
                                name="document"
                                control={control}
                                label="CPF/CNPJ"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormTextField
                                name="email"
                                control={control}
                                label="Email"
                                type="email"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormTextField
                                name="phone"
                                control={control}
                                label="Telefone"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormTextField
                                name="zipCode"
                                control={control}
                                label="CEP"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormTextField
                                name="address"
                                control={control}
                                label="Endereço"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormTextField
                                name="neighborhood"
                                control={control}
                                label="Bairro"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormTextField
                                name="city"
                                control={control}
                                label="Cidade"
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="state"
                                    value={control._defaultValues.state}
                                    label="Estado"
                                >
                                    {brazilStates.map((state) => (
                                        <MenuItem key={state} value={state}>
                                            {state}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {isEditMode && (
                            <Grid item xs={12}>
                                <FormSwitch
                                    name="isActive"
                                    control={control}
                                    label="Cliente Ativo"
                                />
                            </Grid>
                        )}
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