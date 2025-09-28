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
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import categoryService from '../../services/api/category.service'
import type { CategoryResponse } from '../../types/dto/category.dto'
import { CategoryModal } from '../../components/modals/CategoryModal'

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    category: CategoryResponse | null
  }>({ open: false, category: null })

  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['categories', debouncedSearch, statusFilter, pagination.paginationProps],
    queryFn: () =>
      categoryService.findMany({
        search: debouncedSearch,
        isActive: statusFilter === '' ? undefined : statusFilter,
        includeProductCount: true, // Importante para a coluna 'Nº de Produtos'
        ...pagination.paginationProps,
      }),
  })

  const { data: stats } = useQuery({
    queryKey: ['categories-stats'],
    queryFn: () => categoryService.getStatistics(),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      categoryService.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-stats'] })
      toast.success('Categoria excluída com sucesso')
      setDeleteDialog({ open: false, category: null })
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao excluir. Verifique se a categoria não possui produtos.')
    },
  })

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setOpenModal(true)
  }
  
  const handleDelete = (category: CategoryResponse) => {
    setDeleteDialog({ open: true, category })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedCategory(null)
  }

  const columns = [
    { id: 'name', label: 'Nome' },
    { id: 'cnae', label: 'CNAE' },
    { id: 'productCount', label: 'Nº de Produtos', align: 'center' as const },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: unknown) => (
        <Chip
          label={value ? 'Ativa' : 'Inativa'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Criada em',
      format: (value: unknown) => format(new Date(value as string), 'dd/MM/yyyy'),
    },
  ]

  return (
    <Box>
      <PageHeader
        title="Categorias de Produtos"
        subtitle={`Total de categorias cadastradas: ${stats?.total || 0}`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Nova Categoria
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou descrição..."
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
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="true">Ativas</MenuItem>
            <MenuItem value="false">Inativas</MenuItem>
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
            onClick: (row) => handleEdit(row as unknown as CategoryResponse),
          },
          {
            icon: <DeleteIcon />,
            label: 'Excluir',
            onClick: (row) => handleDelete(row as unknown as CategoryResponse),
            color: 'error',
          },
        ]}
        getRowId={(row) => (row as unknown as CategoryResponse).id}
      />

      <CategoryModal
        open={openModal}
        onClose={handleCloseModal}
        category={selectedCategory}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteDialog.category?.name}"? Esta ação não pode ser desfeita.`}
        type="error"
        onConfirm={() => {
          if (deleteDialog.category) {
            deleteMutation.mutate({
              id: deleteDialog.category.id,
              reason: 'Excluído pelo administrador',
            })
          }
        }}
        onCancel={() => setDeleteDialog({ open: false, category: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}