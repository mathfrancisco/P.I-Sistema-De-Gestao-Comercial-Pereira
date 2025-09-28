import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import supplierService from '../../services/api/supplier.service'
import type { SupplierResponse } from '../../types/dto/supplier.dto'
import { SupplierModal } from '../../components/modals/SupplierModal'

export const SuppliersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null)
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean
    supplier: SupplierResponse | null
  }>({ open: false, supplier: null })

  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', debouncedSearch, statusFilter, pagination.paginationProps],
    queryFn: () =>
      supplierService.findByFilters({
        search: debouncedSearch,
        isActive: statusFilter === '' ? undefined : statusFilter,
        ...pagination.paginationProps,
      }),
  })

  const { data: stats } = useQuery({
    queryKey: ['suppliers-stats'],
    queryFn: () => supplierService.getStatistics(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierService.delete(id), // O backend faz soft delete
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] })
      toast.success('Fornecedor desativado com sucesso')
      setDeactivateDialog({ open: false, supplier: null })
    },
    onError: (error) => toast.error(error.message || 'Erro ao desativar fornecedor.'),
  })

  const handleEdit = (supplier: SupplierResponse) => {
    setSelectedSupplier(supplier)
    setOpenModal(true)
  }
  
  const handleDeactivate = (supplier: SupplierResponse) => {
    setDeactivateDialog({ open: true, supplier })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedSupplier(null)
  }

  const columns = [
    { id: 'name', label: 'Nome / Razão Social' },
    { id: 'contactPerson', label: 'Contato' },
    { id: 'phone', label: 'Telefone' },
    { id: 'city', label: 'Cidade', format: (value: any, row: any) => `${row.city || ''}/${row.state || ''}` },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: unknown) => (
        <Chip
          label={value ? 'Ativo' : 'Inativo'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ]

  return (
    <Box>
      <PageHeader
        title="Fornecedores"
        subtitle={`Total de fornecedores cadastrados: ${stats?.total || 0}`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Novo Fornecedor
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, contato, cidade..."
          sx={{ minWidth: 300 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value
              setStatusFilter(value === '' ? '' : value === 'true')
            }}
            label="Status"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Ativos</MenuItem>
            <MenuItem value="false">Inativos</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <DataTable
        columns={columns}
        rows={data?.content as unknown as Record<string, unknown>[] || []}
        loading={isLoading}
        page={pagination.page}
        rowsPerPage={pagination.size}
        totalElements={data?.totalElements || 0}
        onPageChange={pagination.handlePageChange}
        onRowsPerPageChange={pagination.handleSizeChange}
        onSort={pagination.handleSortChange}
        sortBy={pagination.sortBy}
        sortOrder={pagination.sortOrder}
        actions={[
          {
            icon: <EditIcon />,
            label: 'Editar',
            onClick: (row) => handleEdit(row as unknown as SupplierResponse),
          },
          {
            icon: <BlockIcon />,
            label: 'Desativar',
            onClick: (row) => handleDeactivate(row as unknown as SupplierResponse),
            color: 'error',
            show: (row) => (row as unknown as SupplierResponse).isActive,
          },
        ]}
        getRowId={(row) => (row as unknown as SupplierResponse).id}
      />

      <SupplierModal
        open={openModal}
        onClose={handleCloseModal}
        supplier={selectedSupplier}
      />

      <ConfirmDialog
        open={deactivateDialog.open}
        title="Desativar Fornecedor"
        message={`Tem certeza que deseja desativar o fornecedor "${deactivateDialog.supplier?.name}"?`}
        type="warning"
        onConfirm={() => {
          if (deactivateDialog.supplier) {
            deleteMutation.mutate(deactivateDialog.supplier.id)
          }
        }}
        onCancel={() => setDeactivateDialog({ open: false, supplier: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}