import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
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
import type { SaleResponse, CreateSaleItemRequest, CreateSaleRequest } from '../../types/dto/sale.dto'
import { PaymentMethod } from '../../types/enums'

const saleSchema = yup.object({
  customerId: yup.number().required('Cliente é obrigatório'),
  paymentMethod: yup.string().oneOf(Object.values(PaymentMethod)),
  discount: yup.number().min(0).max(100),
  observations: yup.string(),
})

interface SaleFormProps {
  sale?: SaleResponse | null
  onSuccess: () => void
}

interface CartItem extends CreateSaleItemRequest {
  productName: string
  productCode: string
  subtotal: number
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
  const { data: customers } = useQuery({
    queryKey: ['customers-search'],
    queryFn: () => customerService.search('', 100),
  })
  
  // Query para buscar produtos
  const { data: products } = useQuery({
    queryKey: ['products-search'],
    queryFn: () => productService.search('', 100),
  })
  
  // Mutation para criar/atualizar venda
  const createMutation = useMutation({
    mutationFn: (data: CreateSaleRequest) =>
      sale ? saleService.update(sale.id, data) : saleService.create(data),
    onSuccess: () => {
      toast.success(sale ? 'Venda atualizada com sucesso' : 'Venda criada com sucesso')
      onSuccess()
    },
    onError: () => {
      toast.error('Erro ao salvar venda')
    },
  })
  
  // Carregar dados da venda para edição
  useEffect(() => {
    if (sale) {
      setValue('customerId', sale.customerId)
      setValue('paymentMethod', sale.paymentMethod)
      setValue('discount', sale.discount)
      setValue('observations', sale.observations)
      
      // Converter itens da venda para o formato do carrinho
      const items: CartItem[] = sale.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: '', // Adicionar se necessário
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: item.total,
      }))
      setCartItems(items)
    }
  }, [sale, setValue])
  
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto')
      return
    }
    
    const existingItem = cartItems.find((item) => item.productId === selectedProduct.id)
    
    if (existingItem) {
      // Atualizar quantidade do item existente
      setCartItems(
        cartItems.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice * (1 - item.discount / 100),
              }
            : item
        )
      )
    } else {
      // Adicionar novo item
      const newItem: CartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        quantity,
        unitPrice: selectedProduct.unitPrice,
        discount: itemDiscount,
        subtotal: quantity * selectedProduct.unitPrice * (1 - itemDiscount / 100),
      }
      setCartItems([...cartItems, newItem])
    }
    
    // Limpar seleção
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
  
  const onSubmit = async (data: any) => {
    if (cartItems.length === 0) {
      toast.error('Adicione pelo menos um produto')
      return
    }
    
    const saleData: CreateSaleRequest = {
      customerId: data.customerId,
      userId: user!.id,
      paymentMethod: data.paymentMethod,
      discount: data.discount,
      observations: data.observations,
      items: cartItems.map(({ productName, productCode, subtotal, ...item }) => item),
    }
    
    await createMutation.mutateAsync(saleData)
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* Seção de Cliente e Pagamento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações da Venda
              </Typography>
              
              <Autocomplete
                options={customers || []}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    required
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                    margin="normal"
                    fullWidth
                  />
                )}
                onChange={(_, value) => {
                  setSelectedCustomer(value)
                  setValue('customerId', value?.id || 0)
                }}
                value={selectedCustomer}
              />
              
              <TextField
                select
                label="Forma de Pagamento"
                fullWidth
                margin="normal"
                SelectProps={{ native: true }}
                {...register('paymentMethod')}
              >
                <option value="">Selecione</option>
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </TextField>
              
              <TextField
                label="Desconto Global (%)"
                type="number"
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                {...register('discount')}
              />
              
              <TextField
                label="Observações"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                {...register('observations')}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Seção de Adicionar Produto */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adicionar Produto
              </Typography>
              
              <Autocomplete
                options={products || []}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Produto"
                    margin="normal"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                onChange={(_, value) => setSelectedProduct(value)}
                value={selectedProduct}
              />
              
              {selectedProduct && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Preço: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(selectedProduct.unitPrice)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Estoque: {selectedProduct.currentStock || 0} unidades
                  </Typography>
                </Box>
              )}
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantidade"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={6}>
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
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleAddToCart}
                disabled={!selectedProduct}
                sx={{ mt: 2 }}
              >
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tabela de Itens */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Itens da Venda
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Produto</TableCell>
                  <TableCell align="center">Qtd</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="center">Desc. (%)</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum item adicionado
                    </TableCell>
                  </TableRow>
                ) : (
                  cartItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.unitPrice)}
                      </TableCell>
                      <TableCell align="center">{item.discount}%</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.subtotal)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveFromCart(item.productId)}
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
        </Grid>
        
        {/* Resumo e Ações */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h5">
                    Total: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(calculateTotal())}
                  </Typography>
                  {globalDiscount > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Desconto aplicado: {globalDiscount}%
                    </Typography>
                  )}
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={createMutation.isPending}
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