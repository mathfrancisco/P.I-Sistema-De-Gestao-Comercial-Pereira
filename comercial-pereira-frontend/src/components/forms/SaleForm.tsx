import React, { useState, useEffect } from 'react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    InputAdornment,
    Card,
    CardContent,
    Divider,
    Grid,
} from '@mui/material'
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    ShoppingCart as CartIcon,
} from '@mui/icons-material'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useFormWithValidation } from '../../hooks/useFormExtended'
import customerService from '../../services/api/customer.service'
import productService from '../../services/api/product.service'
import saleService from '../../services/api/sale.service'
import type { CustomerResponse } from '../../types/dto/customer.dto'
import type { ProductResponse } from '../../types/dto/product.dto'
import type { SaleResponse, CreateSaleRequest, SaleItemRequest } from '../../types/dto/sale.dto'

const saleSchema = yup.object({
    customerId: yup.number().required('Cliente é obrigatório'),
    discount: yup.number().min(0).max(100),
    notes: yup.string(),
})

interface SaleFormProps {
    sale?: SaleResponse | null
    onSuccess: () => void
}

interface CartItem extends SaleItemRequest {
    productName: string
    productCode: string
    subtotal: number
}

interface FormData {
    customerId: number
    discount?: number
    notes?: string
}

export const SaleForm: React.FC<SaleFormProps> = ({ sale, onSuccess }) => {
    const { user } = useAuth()
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [quantity, setQuantity] = useState(1)
    const [itemDiscount, setItemDiscount] = useState(0)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useFormWithValidation(saleSchema)

    const globalDiscount = watch('discount') || 0

    // Query para buscar clientes
    const { data: customersData } = useQuery({
        queryKey: ['customers-search'],
        queryFn: () => customerService.search('', 100),
    })
    const customers = Array.isArray(customersData) ? customersData : []

    // Query para buscar produtos
    const { data: productsData } = useQuery({
        queryKey: ['products-search'],
        queryFn: () => productService.search(''),
    })
    const products = Array.isArray(productsData) ? productsData : []

    // Mutation para criar venda
    const createMutation = useMutation({
        mutationFn: (data: CreateSaleRequest) => saleService.create(data),
        onSuccess: () => {
            toast.success('Venda criada com sucesso')
            onSuccess()
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao salvar venda')
        },
    })

    // Carregar dados da venda para edição (se houver)
    useEffect(() => {
        if (sale && customers.length > 0) {
            setValue('customerId', sale.customer.id)
            setValue('discount', sale.discount || 0)
            setValue('notes', sale.notes || '')

            const customer = customers.find(c => c.id === sale.customer.id)
            setSelectedCustomer(customer || null)

            const items: CartItem[] = sale.items.map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                productCode: item.product.code,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                subtotal: item.total,
            }))
            setCartItems(items)
        }
    }, [sale, setValue, customers])

    const handleAddToCart = () => {
        if (!selectedProduct) {
            toast.error('Selecione um produto')
            return
        }

        if (quantity <= 0) {
            toast.error('Quantidade deve ser maior que zero')
            return
        }

        const existingItem = cartItems.find((item) => item.productId === selectedProduct.id)
        const unitPrice = selectedProduct.price

        if (existingItem) {
            setCartItems(
                cartItems.map((item) =>
                    item.productId === selectedProduct.id
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            subtotal: (item.quantity + quantity) * item.unitPrice! * (1 - (item.discount || 0) / 100),
                        }
                        : item
                )
            )
        } else {
            const newItem: CartItem = {
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                productCode: selectedProduct.code,
                quantity,
                unitPrice,
                discount: itemDiscount,
                subtotal: quantity * unitPrice * (1 - itemDiscount / 100),
            }
            setCartItems([...cartItems, newItem])
        }

        setSelectedProduct(null)
        setQuantity(1)
        setItemDiscount(0)
    }

    const handleRemoveFromCart = (productId: number) => {
        setCartItems(cartItems.filter((item) => item.productId !== productId))
    }

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
        return subtotal * (1 - globalDiscount / 100)
    }

    const onSubmit = async (data: FormData) => {
        if (cartItems.length === 0) {
            toast.error('Adicione pelo menos um produto')
            return
        }

        const saleData: CreateSaleRequest = {
            customerId: data.customerId,
            discount: data.discount || 0,
            tax: 0,
            notes: data.notes || '',
            items: cartItems.map(({ productName, productCode, subtotal, ...item }) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
            })),
        }

        await createMutation.mutateAsync(saleData)
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Seção de Cliente e Pagamento */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Card
                        sx={{
                            height: '100%',
                            borderRadius: '16px',
                            border: '1px solid #E3F2FD',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#1E293B',
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    Informações da Venda
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    Preencha os dados básicos da venda
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Autocomplete
                                options={customers}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cliente"
                                        required
                                        error={!!errors.customerId}
                                        helperText={errors.customerId?.message}
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                    />
                                )}
                                onChange={(_, value) => {
                                    setSelectedCustomer(value)
                                    setValue('customerId', value?.id || 0)
                                }}
                                value={selectedCustomer}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Desconto Global (%)"
                                type="number"
                                fullWidth
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                                {...register('discount')}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                            />

                            <TextField
                                label="Observações"
                                multiline
                                rows={3}
                                fullWidth
                                {...register('notes')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Seção de Adicionar Produto */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Card
                        sx={{
                            height: '100%',
                            borderRadius: '16px',
                            border: '1px solid #E3F2FD',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#1E293B',
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    Adicionar Produto
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    Selecione produtos e adicione ao carrinho
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Autocomplete
                                options={products}
                                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Produto"
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: '#64748B' }} />
                                                    </InputAdornment>
                                                    {params.InputProps.startAdornment}
                                                </>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                    />
                                )}
                                onChange={(_, value) => setSelectedProduct(value)}
                                value={selectedProduct}
                            />

                            {selectedProduct && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        backgroundColor: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '1px solid #E3F2FD',
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                                Preço Unitário
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(selectedProduct.price)}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                                Estoque Disponível
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                                {selectedProduct.inventory?.quantity || 0} un.
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Quantidade"
                                        type="number"
                                        fullWidth
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        InputProps={{ inputProps: { min: 1 } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Desconto (%)"
                                        type="number"
                                        fullWidth
                                        value={itemDiscount}
                                        onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                                        InputProps={{
                                            inputProps: { min: 0, max: 100 },
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={handleAddToCart}
                                disabled={!selectedProduct}
                                sx={{
                                    mt: 2,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
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
                                        color: '#94A3B8',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                Adicionar ao Carrinho
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tabela de Itens */}
                <Grid size={{ xs: 12 }}>
                    <Card
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid #E3F2FD',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <CartIcon sx={{ color: '#3B82F6', mr: 2, fontSize: 28 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                        Itens da Venda
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                                        {cartItems.length} {cartItems.length === 1 ? 'item adicionado' : 'itens adicionados'}
                                    </Typography>
                                </Box>
                            </Box>

                            <TableContainer
                                component={Paper}
                                sx={{
                                    borderRadius: '12px',
                                    border: '1px solid #E3F2FD',
                                    boxShadow: 'none',
                                    maxHeight: 400,
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Código
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Produto
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Qtd
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Preço Unit.
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Desc. (%)
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Subtotal
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: '#1E293B', backgroundColor: '#F8FAFC' }}>
                                                Ações
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cartItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                                    <CartIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                                                    <Typography sx={{ color: '#64748B' }}>
                                                        Nenhum item adicionado ao carrinho
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                                                        Selecione um produto acima para começar
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cartItems.map((item, index) => (
                                                <TableRow
                                                    key={item.productId}
                                                    sx={{
                                                        backgroundColor: index % 2 === 0 ? 'white' : '#FAFBFF',
                                                        '&:hover': {
                                                            backgroundColor: '#EBF8FF',
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ color: '#64748B' }}>
                                                        {item.productCode}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#1E293B', fontWeight: 500 }}>
                                                        {item.productName}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#64748B' }}>
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: '#64748B' }}>
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        }).format(item.unitPrice || 0)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#64748B' }}>
                                                        {item.discount || 0}%
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        }).format(item.subtotal)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveFromCart(item.productId)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: '#FEE2E2',
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Resumo e Ações */}
                <Grid size={{ xs: 12 }}>
                    <Card
                        sx={{
                            borderRadius: '16px',
                            border: '2px solid #3B82F6',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                                            Total da Venda
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                color: '#3B82F6',
                                                fontWeight: 700,
                                                mb: 1,
                                            }}
                                        >
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(calculateTotal())}
                                        </Typography>
                                        {globalDiscount > 0 && (
                                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                                Desconto global de {globalDiscount}% aplicado
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={<SaveIcon />}
                                        disabled={createMutation.isPending || cartItems.length === 0}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                                                transform: 'translateY(-1px)',
                                            },
                                            '&:disabled': {
                                                background: '#E2E8F0',
                                                color: '#94A3B8',
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        {sale ? 'Atualizar Venda' : 'Finalizar Venda'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}