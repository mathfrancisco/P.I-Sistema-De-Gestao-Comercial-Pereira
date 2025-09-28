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
} from '@mui/material'
import { Add as AddIcon , Edit as EditIcon} from '@mui/icons-material'
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
      format: (value: string, row: CustomerResponse) =>
        row.city && row.state ? `${row.city}/${row.state}` : '-',
    },
    {
      id: 'type',
      label: 'Tipo',
      format: (value: CustomerType) =>
        value === CustomerType.FISICA ? 'Pessoa Física' : 'Pessoa Jurídica',
    },
  ]
  
  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Novo Cliente
          </Button>
        }
      />
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, documento, email..."
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Cliente</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CustomerType | '')}
              label="Tipo de Cliente"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={CustomerType.FISICA}>Pessoa Física</MenuItem>
              <MenuItem value={CustomerType.JURIDICA}>Pessoa Jurídica</MenuItem>
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
        ]}
        getRowId={(row) => row.id}
      />
      
      <CustomerModal
        open={openModal}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </Box>
  )
}