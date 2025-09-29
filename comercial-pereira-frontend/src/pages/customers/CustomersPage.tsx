import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material'
import { Add as AddIcon , Edit as EditIcon, FilterList as FilterIcon} from '@mui/icons-material'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import customerService from '../../services/api/customer.service'
import type { CustomerResponse } from '../../types/dto/customer.dto'
import { CustomerType } from '../../types/enums'
import {CustomerModal} from "../../components/modals/CustomerModal.tsx";

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CustomerType | ''>('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null)
  
  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()
  
  const { data, isLoading } = useQuery({
    queryKey: ['customers', debouncedSearch, typeFilter, pagination.paginationProps],
    queryFn: () =>
      customerService.findAll({
        search: debouncedSearch,
        type: typeFilter || undefined,
        isActive: true,
        ...pagination.paginationProps,
      }),
  })
  
  const handleEdit = (customer: CustomerResponse) => {
    setSelectedCustomer(customer)
    setOpenModal(true)
  }
  
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedCustomer(null)
  }
  
  const columns = [
    {
      id: 'name',
      label: 'Nome',
    },
    {
      id: 'document',
      label: 'Documento',
      format: (value: string) => value || '-',
    },
    {
      id: 'email',
      label: 'Email',
      format: (value: string) => value || '-',
    },
    {
      id: 'phone',
      label: 'Telefone',
      format: (value: string) => value || '-',
    },
    {
      id: 'city',
      label: 'Cidade',
      format: (_value: string, row: CustomerResponse) =>
        row.city && row.state ? `${row.city}/${row.state}` : '-',
    },
    {
      id: 'type',
      label: 'Tipo',
      format: (value: CustomerType) => (
        <Chip
          label={value === CustomerType.FISICA ? 'Pessoa Física' : 'Pessoa Jurídica'}
          size="small"
          sx={{
            backgroundColor: value === CustomerType.FISICA ? '#DBEAFE' : '#F3E8FF',
            color: value === CustomerType.FISICA ? '#1E40AF' : '#7C3AED',
            fontWeight: 600,
            borderRadius: '8px',
            border: value === CustomerType.FISICA ? '1px solid #93C5FD' : '1px solid #C4B5FD',
          }}
        />
      ),
    },
  ]
  
  return (
    <Box sx={{ backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Clientes' },
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
            Novo Cliente
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
                  placeholder="Buscar por nome, documento, email..."
                  sx={{
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
              </Grid>
              
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as CustomerType | '')}
                    label="Tipo de Cliente"
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
                    <MenuItem value={CustomerType.FISICA}>Pessoa Física</MenuItem>
                    <MenuItem value={CustomerType.JURIDICA}>Pessoa Jurídica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      
      {/* Data Table */}
      <Box sx={{ px: 3 }}>
        <DataTable<CustomerResponse>
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
          ]}
          getRowId={(row) => row.id}
        />
      </Box>
      
      <CustomerModal
        open={openModal}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </Box>
  )
}