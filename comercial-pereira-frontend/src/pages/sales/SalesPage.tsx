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
} from "@mui/material";
import {
  Add as AddIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { DataTable } from "../../components/tables/DataTable";
import { SearchField } from "../../components/common/SearchField";
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

  // Query para buscar vendas
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

  // Mutation para cancelar venda
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
      id: "customerName",
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
        const statusColors = {
          [SaleStatus.PENDING]: "warning",
          [SaleStatus.COMPLETED]: "success",
          [SaleStatus.CANCELLED]: "error",
        } as const;

        const statusLabels = {
          [SaleStatus.PENDING]: "Pendente",
          [SaleStatus.COMPLETED]: "Concluída",
          [SaleStatus.CANCELLED]: "Cancelada",
        };

        return (
          <Chip
            label={statusLabels[status]}
            color={statusColors[status]}
            size="small"
          />
        );
      },
    },
    {
      id: "userName",
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
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Vendas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nova Venda
        </Button>
      </Box>

      <Box mb={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente, código..."
            sx={{ minWidth: { xs: '100%', md: 300 } }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as SaleStatus | "")
              }
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={SaleStatus.PENDING}>Pendente</MenuItem>
              <MenuItem value={SaleStatus.COMPLETED}>Concluída</MenuItem>
              <MenuItem value={SaleStatus.CANCELLED}>Cancelada</MenuItem>
            </Select>
          </FormControl>
          
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Exportar
            </Button>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              Imprimir
            </Button>
          </Box>
        </Stack>
      </Box>

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

      {/* Modal de formulário de venda */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="lg"
        fullWidth
        fullScreen
      >
        <DialogTitle>
          {editMode ? "Editar Venda" : "Nova Venda"}
          <IconButton
            onClick={handleCloseForm}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SaleForm
            sale={selectedSale}
            onSuccess={() => {
              handleCloseForm();
              queryClient.invalidateQueries({ queryKey: ["sales"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da venda */}
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
