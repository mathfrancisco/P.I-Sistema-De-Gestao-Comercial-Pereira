import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
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
    Chip, Grid,
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

    const calculateSubtotal = () => {
        return sale.items.reduce((sum, item) => sum + item.total, 0)
    }

    const handleSendEmail = () => {
        // Implementar envio de email
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
            <DialogTitle
                sx={{
                    borderBottom: '1px solid #E3F2FD',
                    backgroundColor: '#FAFBFF',
                    p: 3,
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                backgroundColor: '#EBF8FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ReceiptIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                        </Box>
                        <Box>
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
                                Venda #{String(sale.id).padStart(6, '0')}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                Detalhes da venda
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            onClick={handlePrint}
                            sx={{
                                color: '#64748B',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: '#EBF8FF',
                                    color: '#3B82F6',
                                }
                            }}
                        >
                            <PrintIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleSendEmail}
                            sx={{
                                color: '#64748B',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: '#EBF8FF',
                                    color: '#3B82F6',
                                }
                            }}
                        >
                            <EmailIcon />
                        </IconButton>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#64748B',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: '#FEF2F2',
                                    color: '#EF4444',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, backgroundColor: 'white' }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Box
                            sx={{
                                p: 3,
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #E3F2FD',
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                    Status da Venda
                                </Typography>
                                <StatusChip status={sale.status} type="sale" />
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 0.5 }}>
                                        Cliente
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 500 }}>
                                        {sale.customer.name}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 0.5 }}>
                                        Vendedor
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 500 }}>
                                        {sale.user.name}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 0.5 }}>
                                        Data da Venda
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 500 }}>
                                        {format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1E293B',
                                fontWeight: 600,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 24,
                                    backgroundColor: '#3B82F6',
                                    borderRadius: '3px',
                                }}
                            />
                            Itens da Venda
                        </Typography>

                        <TableContainer
                            component={Paper}
                            sx={{
                                borderRadius: '12px',
                                border: '1px solid #E3F2FD',
                                overflow: 'hidden',
                                boxShadow: 'none',
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>Produto</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1E293B' }}>Qtd</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#1E293B' }}>Preço Unit.</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1E293B' }}>Desc.</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#1E293B' }}>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sale.items.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? 'white' : '#FAFBFF',
                                                '&:hover': {
                                                    backgroundColor: '#EBF8FF',
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ color: '#1E293B', fontWeight: 500 }}>
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#64748B' }}>
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: '#64748B' }}>
                                                {formatCurrency(item.unitPrice)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.discount ? (
                                                    <Chip
                                                        label={`${item.discount}%`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#FEF3C7',
                                                            color: '#92400E',
                                                            fontWeight: 600,
                                                            borderRadius: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ color: '#94A3B8' }}>-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box
                            sx={{
                                p: 3,
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #E3F2FD',
                            }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2}>
                                <Box display="flex" justifyContent="space-between" sx={{ width: '300px' }}>
                                    <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                                        Subtotal:
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                        {formatCurrency(calculateSubtotal())}
                                    </Typography>
                                </Box>

                                {sale.discount && sale.discount > 0 && (
                                    <Box display="flex" justifyContent="space-between" sx={{ width: '300px' }}>
                                        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                                            Desconto ({sale.discount}%):
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#EF4444', fontWeight: 600 }}>
                                            -{formatCurrency(calculateSubtotal() * (sale.discount / 100))}
                                        </Typography>
                                    </Box>
                                )}

                                <Divider sx={{ width: '300px', borderColor: '#CBD5E1' }} />

                                <Box display="flex" justifyContent="space-between" sx={{ width: '300px' }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#1E293B',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Total:
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#3B82F6',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {formatCurrency(sale.total)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    borderTop: '1px solid #E3F2FD',
                    backgroundColor: '#FAFBFF',
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
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
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    )
}