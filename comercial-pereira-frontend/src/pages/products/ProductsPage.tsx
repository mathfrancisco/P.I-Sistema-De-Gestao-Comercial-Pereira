import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Grid,
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
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { ProductModal } from '../../components/modals/ProductModal'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import productService from '../../services/api/product.service'
import type { ProductResponse } from '../../types/dto/product.dto'
import categoryService from '../../services/api/category.service'

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: ProductResponse | null }>({
    open: false,
    product: null,
  })
  
  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()
  
  // Query para produtos
  const { data, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, categoryFilter, statusFilter, pagination.paginationProps],
    queryFn: () =>
      productService.findByFilters({
        search: debouncedSearch,
        categoryId: categoryFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter,
        ...pagination.paginationProps,
      }),
  })
  
  // Query para categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryService.getActiveCategories(),
  })
  
  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => productService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Status atualizado com sucesso')
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto excluído com sucesso')
      setDeleteDialog({ open: false, product: null })
    },
  })
  
  const handleEdit = (product: ProductResponse) => {
    setSelectedProduct(product)
    setOpenModal(true)
  }
  
  const handleDelete = (product: ProductResponse) => {
    setDeleteDialog({ open: true, product })
  }
  
  const handleToggleStatus = (product: ProductResponse) => {
    toggleStatusMutation.mutate(product.id)
  }
  
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedProduct(null)
  }
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  
  const columns = [
    {
      id: 'code',
      label: 'Código',
      width: 100,
    },
    {
      id: 'name',
      label: 'Nome',
    },
    {
      id: 'categoryName',
      label: 'Categoria',
    },
    {
      id: 'supplierName',
      label: 'Fornecedor',
    },
    {
      id: 'unitPrice',
      label: 'Preço',
      numeric: true,
      format: formatCurrency,
    },
    {
      id: 'currentStock',
      label: 'Estoque',
      numeric: true,
      format: (value: number | null) => {
        if (value === null || value === undefined) return '-'
        if (value === 0) return <Chip label="Sem Estoque" color="error" size="small" />
        if (value < 10) return <Chip label={value} color="warning" size="small" />
        return value
      },
    },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: boolean) => (
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
        title="Produtos"
        subtitle="Gerencie seu catálogo de produtos"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Produtos' },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Novo Produto
          </Button>
        }
      />
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por código, nome, código de barras..."
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as number | '')}
              label="Categoria"
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as boolean | '')}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={true as any}>Ativos</MenuItem>
              <MenuItem value={false as any}>Inativos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <DataTable
        columns={columns}
        rows={data?.content || []}
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
            onClick: handleEdit,
          },
          {
            icon: (row: ProductResponse) =>
              row.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />,
            label: (row: ProductResponse) =>
              row.isActive ? 'Desativar' : 'Ativar',
            onClick: handleToggleStatus,
          },
          {
            icon: <DeleteIcon />,
            label: 'Excluir',
            onClick: handleDelete,
            color: 'error',
          },
        ]}
        getRowId={(row) => row.id}
      />
      
      <ProductModal
        open={openModal}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
      
      <ConfirmDialog
        open={deleteDialog.open}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${deleteDialog.product?.name}"?`}
        type="error"
        onConfirm={() => {
          if (deleteDialog.product) {
            deleteMutation.mutate(deleteDialog.product.id)
          }
        }}
        onCancel={() => setDeleteDialog({ open: false, product: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}