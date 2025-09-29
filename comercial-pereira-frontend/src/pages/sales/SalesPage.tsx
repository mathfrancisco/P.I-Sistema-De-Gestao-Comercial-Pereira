import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
} from "@mui/material";
import {
    Add as AddIcon,
    GetApp as DownloadIcon,
    Print as PrintIcon,
    Cancel as CancelIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { DataTable } from "../../components/tables/DataTable";
import { SearchField } from "../../components/common/SearchField";
import { PageHeader } from "../../components/common/PageHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import saleService from "../../services/api/sale.service";
import type { SaleResponse } from "../../types/dto/sale.dto";
import { SaleStatus } from "../../types/enums";
import { SaleForm } from "../../components/forms/SaleForm";
import { SaleDetails } from "../../components/modals/SaleDetails";

export const SalesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<SaleStatus | "">("");
    const [openForm, setOpenForm] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
    const [editMode, setEditMode] = useState(false);

    const debouncedSearch = useDebounce(search, 500);
    const pagination = usePagination();

    const { data, isLoading, error } = useQuery({
        queryKey: [
            "sales",
            debouncedSearch,
            statusFilter,
            pagination.paginationProps,
        ],
        queryFn: () =>
            saleService.findAll({
                search: debouncedSearch,
                status: statusFilter || undefined,
                ...pagination.paginationProps,
            }),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => saleService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            toast.success("Venda cancelada com sucesso");
        },
        onError: () => {
            toast.error("Erro ao cancelar venda");
        },
    });

    const completeMutation = useMutation({
        mutationFn: (id: number) => saleService.complete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            toast.success("Venda finalizada com sucesso");
        },
        onError: () => {
            toast.error("Erro ao finalizar venda");
        },
    });

    const handleComplete = async (sale: SaleResponse) => {
        if (window.confirm("Tem certeza que deseja finalizar esta venda?")) {
            await completeMutation.mutateAsync(sale.id);
        }
    };

    const handleViewDetails = (sale: SaleResponse) => {
        setSelectedSale(sale);
        setOpenDetails(true);
    };

    const handleEdit = (sale: SaleResponse) => {
        setSelectedSale(sale);
        setEditMode(true);
        setOpenForm(true);
    };

    const handleCancel = async (sale: SaleResponse) => {
        if (window.confirm("Tem certeza que deseja cancelar esta venda?")) {
            await cancelMutation.mutateAsync(sale.id);
        }
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedSale(null);
        setEditMode(false);
    };

    const columns = [
        {
            id: "id",
            label: "Código",
            format: (value: unknown) => `#${String(value).padStart(6, "0")}`,
        },
        {
            id: "customer.name",
            label: "Cliente",
        },
        {
            id: "saleDate",
            label: "Data",
            format: (value: unknown) => format(new Date(value as string), "dd/MM/yyyy"),
        },
        {
            id: "total",
            label: "Total",
            numeric: true,
            format: (value: unknown) =>
                new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(value as number),
        },
        {
            id: "status",
            label: "Status",
            format: (value: unknown) => {
                const status = value as SaleStatus;
                const statusStyles = {
                    [SaleStatus.DRAFT]: { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' },
                    [SaleStatus.PENDING]: { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' },
                    [SaleStatus.COMPLETED]: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #10B981' },
                    [SaleStatus.CANCELLED]: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #EF4444' },
                };

                const statusLabels = {
                    [SaleStatus.DRAFT]: "Rascunho",
                    [SaleStatus.PENDING]: "Pendente",
                    [SaleStatus.COMPLETED]: "Concluída",
                    [SaleStatus.CANCELLED]: "Cancelada",
                };

                return (
                    <Chip
                        label={statusLabels[status] || status}
                        size="small"
                        sx={{
                            ...statusStyles[status],
                            fontWeight: 600,
                            borderRadius: '8px',
                        }}
                    />
                );
            },
        },
        {
            id: "user.name",
            label: "Vendedor",
        },
    ];

    const actions = [
        {
            icon: <ViewIcon />,
            label: "Visualizar",
            onClick: handleViewDetails,
        },
        {
            icon: <EditIcon />,
            label: "Editar",
            onClick: handleEdit,
            show: (row: SaleResponse) => row.status === SaleStatus.PENDING,
        },
        {
            icon: <CancelIcon />,
            label: "Cancelar",
            onClick: handleCancel,
            color: "error" as const,
            show: (row: SaleResponse) => row.status !== SaleStatus.CANCELLED,
        },
        {
            icon: <CheckCircleIcon />,
            label: "Finalizar",
            onClick: handleComplete,
            color: "success" as const,
            show: (row: SaleResponse) => row.status === SaleStatus.PENDING || row.status === SaleStatus.DRAFT,
        }
    ];

    return (
        <Box sx={{ backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
            <PageHeader
                title="Vendas"
                subtitle="Gerencie suas vendas e acompanhe o desempenho"
                breadcrumbs={[
                    { label: 'Dashboard', path: '/' },
                    { label: 'Vendas' },
                ]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenForm(true)}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
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
                        Nova Venda
                    </Button>
                }
            />

            <Box sx={{ px: 3, pb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E3F2FD' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <FilterIcon sx={{ color: '#64748B', mr: 1 }} />
                            <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
                                Filtros e Ações
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                            <SearchField
                                value={search}
                                onChange={setSearch}
                                placeholder="Buscar por cliente, código..."
                                sx={{
                                    minWidth: { xs: '100%', md: 300 },
                                    '& .MuiOutlinedInput-root': {
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
                                    },
                                }}
                            />

                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value as SaleStatus | "")
                                    }
                                    label="Status"
                                    sx={{
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
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value={SaleStatus.PENDING}>Pendente</MenuItem>
                                    <MenuItem value={SaleStatus.COMPLETED}>Concluída</MenuItem>
                                    <MenuItem value={SaleStatus.CANCELLED}>Cancelada</MenuItem>
                                </Select>
                            </FormControl>

                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: '#E3F2FD',
                                        color: '#64748B',
                                        '&:hover': {
                                            borderColor: '#93C5FD',
                                            backgroundColor: '#F8FAFC',
                                        },
                                    }}
                                >
                                    Exportar
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: '#E3F2FD',
                                        color: '#64748B',
                                        '&:hover': {
                                            borderColor: '#93C5FD',
                                            backgroundColor: '#F8FAFC',
                                        },
                                    }}
                                >
                                    Imprimir
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ px: 3 }}>
                <DataTable<SaleResponse>
                    columns={columns}
                    rows={data?.content || []}
                    loading={isLoading}
                    error={error?.message}
                    page={pagination.page}
                    rowsPerPage={pagination.size}
                    totalElements={data?.totalElements || 0}
                    onPageChange={pagination.handlePageChange}
                    onRowsPerPageChange={pagination.handleSizeChange}
                    onSort={pagination.handleSortChange}
                    sortBy={pagination.sortBy}
                    sortOrder={pagination.sortOrder}
                    actions={actions}
                    getRowId={(row) => row.id}
                    emptyMessage="Nenhuma venda encontrada"
                />
            </Box>

            <Dialog
                open={openForm}
                onClose={handleCloseForm}
                maxWidth="lg"
                fullWidth
                fullScreen
                PaperProps={{
                    sx: {
                        backgroundColor: '#FAFBFF',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: '1px solid #E3F2FD',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 3,
                    }}
                >
                    <Box sx={{
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        color: '#1E293B',
                        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {editMode ? "Editar Venda" : "Nova Venda"}
                    </Box>
                    <IconButton
                        onClick={handleCloseForm}
                        sx={{
                            color: '#64748B',
                            '&:hover': {
                                backgroundColor: '#EBF8FF',
                                color: '#3B82F6',
                            }
                        }}
                    >
                        <CancelIcon />
                    </IconButton>

                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#FAFBFF', p: 0 }}>
                    <SaleForm
                        sale={selectedSale}
                        onSuccess={() => {
                            handleCloseForm();
                            queryClient.invalidateQueries({ queryKey: ["sales"] });
                        }}
                    />
                </DialogContent>
            </Dialog>

            {selectedSale && !editMode && (
                <SaleDetails
                    open={openDetails}
                    onClose={() => {
                        setOpenDetails(false);
                        setSelectedSale(null);
                    }}
                    sale={selectedSale}
                />
            )}
        </Box>
    );
};