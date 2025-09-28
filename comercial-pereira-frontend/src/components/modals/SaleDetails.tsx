import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
} from '@mui/material'
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { StatusChip } from '../common/StatusChip'
import type { SaleResponse } from '../../types/dto/sale.dto'

interface SaleDetailsProps {
  open: boolean
  onClose: () => void
  sale: SaleResponse
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({
  open,
  onClose,
  sale,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const handlePrint = () => {
    window.print()
  }

  const handleSendEmail = () => {
    // Implementar envio de email
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptIcon />
            <Typography variant="h6">
              Venda #{String(sale.id).padStart(6, '0')}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleSendEmail}>
              <EmailIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Informações Gerais */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                Status da Venda
              </Typography>
              <StatusChip status={sale.status} type="sale" />
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Cliente
            </Typography>
            <Typography variant="body1">{sale.customerName}</Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Vendedor
            </Typography>
            <Typography variant="body1">{sale.userName}</Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Data da Venda
            </Typography>
            <Typography variant="body1">
              {format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Forma de Pagamento
            </Typography>
            <Typography variant="body1">
              {sale.paymentMethod || 'Não informado'}
            </Typography>
          </Grid>
          
          {sale.observations && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Observações
              </Typography>
              <Typography variant="body1">{sale.observations}</Typography>
            </Grid>
          )}
          
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          
          {/* Itens da Venda */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Itens da Venda
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell align="center">Qtd</TableCell>
                    <TableCell align="right">Preço Unit.</TableCell>
                    <TableCell align="center">Desc.</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="center">
                        {item.discount ? `${item.discount}%` : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Totais */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
              <Box display="flex" gap={4}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">
                  {formatCurrency(sale.subtotal)}
                </Typography>
              </Box>
              
              {sale.discount && sale.discount > 0 && (
                <Box display="flex" gap={4}>
                  <Typography variant="body1">Desconto ({sale.discount}%):</Typography>
                  <Typography variant="body1" color="error">
                    -{formatCurrency(sale.subtotal * (sale.discount / 100))}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ width: 200, my: 1 }} />
              
              <Box display="flex" gap={4}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(sale.total)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}