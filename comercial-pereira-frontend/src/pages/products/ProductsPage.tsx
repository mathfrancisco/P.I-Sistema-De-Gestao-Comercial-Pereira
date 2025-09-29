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
            id: 'category.name',  // ← Acessa o nome dentro do objeto category
            label: 'Categoria',
        },
        {
            id: 'supplier.name',  // ← Acessa o nome dentro do objeto supplier
            label: 'Fornecedor',
        },
        {
            id: 'price',  // ← Mudou de unitPrice para price
            label: 'Preço',
            numeric: true,
            format: formatCurrency,
        },
        {
            id: 'inventory.quantity',  // ← Acessa quantity dentro de inventory
            label: 'Estoque',
            numeric: true,
            format: (value: number | null) => {
                if (value === null || value === undefined) return '-'
                if (value === 0) return (
                    <Chip
                        label="Sem Estoque"
                        size="small"
                        sx={{
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid #FECACA',
                        }}
                    />
                )
                if (value < 10) return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid #FCD34D',
                        }}
                    />
                )
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            backgroundColor: '#D1FAE5',
                            color: '#065F46',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid #10B981',
                        }}
                    />
                )
            },
        },
        {
            id: 'isActive',
            label: 'Status',
            format: (value: boolean) => (
                <Chip
                    label={value ? 'Ativo' : 'Inativo'}
                    sx={{
                        backgroundColor: value ? '#D1FAE5' : '#F3F4F6',
                        color: value ? '#065F46' : '#6B7280',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: value ? '1px solid #10B981' : '1px solid #9CA3AF',
                    }}
                    size="small"
                />
            ),
        },
    ];
  
  return (
    <Box sx={{ backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
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
            Novo Produto
          </Button>
        }
      />
      
      {/* Filters Section */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E3F2FD' }}>
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