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
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  FilterList as FilterIcon,
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
        if (value === 0) return <Chip label="Sem Estoque" color="error" size="small" sx={{ borderRadius: '8px' }} />
        if (value < 10) return <Chip label={value} color="warning" size="small" sx={{ borderRadius: '8px' }} />
        return <Chip label={value} color="success" size="small" sx={{ borderRadius: '8px' }} />
      },
    },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: boolean) => (
        <Chip
          label={value ? 'Ativo' : 'Inativo'}
          sx={{
            backgroundColor: value ? '#DCFCE7' : '#F3F4F6',
            color: value ? '#166534' : '#6B7280',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
          }}
          size="small"
        />
      ),
    },
  ]
  
  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <PageHeader
        title="Product"
        subtitle="Gerencie seu catálogo de produtos"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Product' },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Novo Produto
          </Button>
        }
      />
      
      {/* Filters Section */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FilterIcon sx={{ color: '#64748B', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600 }}>
                Filtros
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por código, nome, código de barras..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      '& fieldset': {
                        borderColor: '#E2E8F0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#CBD5E1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4F46E5',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as number | '')}
                    label="Categoria"
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      '& fieldset': {
                        borderColor: '#E2E8F0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#CBD5E1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4F46E5',
                        borderWidth: '2px',
                      },
                    }}
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
              
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as boolean | '')}
                    label="Status"
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      '& fieldset': {
                        borderColor: '#E2E8F0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#CBD5E1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4F46E5',
                        borderWidth: '2px',
                      },
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value={true as any}>Ativos</MenuItem>
                    <MenuItem value={false as any}>Inativos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Data Table */}
      <Box sx={{ px: 3 }}>
        <DataTable<ProductResponse>
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
              color: 'primary',
            },
            {
              icon: <ToggleOffIcon />,
              label: 'Alternar Status',
              onClick: handleToggleStatus,
              color: 'warning',
              show: (row) => row.isActive,
            },
            {
              icon: <ToggleOnIcon />,
              label: 'Alternar Status',
              onClick: handleToggleStatus,
              color: 'success',
              show: (row) => !row.isActive,
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
      </Box>
      
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
