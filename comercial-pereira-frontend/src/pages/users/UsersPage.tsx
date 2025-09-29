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
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  VpnKey as KeyIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import userService from '../../services/api/user.service'
import type { UserResponse } from '../../types/dto/user.dto'
import { UserRole } from '../../types/enums'
import { UserModal } from '../../components/modals/UserModal'
import { ResetPasswordModal } from '../../components/modals/ResetPasswordModal'

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    open: boolean
    user: UserResponse | null
  }>({ open: false, user: null })
  const [blockDialog, setBlockDialog] = useState<{
    open: boolean
    user: UserResponse | null
  }>({ open: false, user: null })
  
  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()
  
  const { data, isLoading } = useQuery({
    queryKey: ['users', debouncedSearch, roleFilter, statusFilter, pagination.paginationProps],
    queryFn: () =>
      userService.findMany({
        search: debouncedSearch,
        role: roleFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter,
        ...pagination.paginationProps,
      }),
  })
  
  const { data: stats } = useQuery({
    queryKey: ['users-stats'],
    queryFn: () => userService.getStatistics(),
  })
  
  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      userService.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário bloqueado com sucesso')
      setBlockDialog({ open: false, user: null })
    },
  })
  
  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user)
    setOpenModal(true)
  }
  
  const handleResetPassword = (user: UserResponse) => {
    setResetPasswordModal({ open: true, user })
  }
  
  const handleBlock = (user: UserResponse) => {
    setBlockDialog({ open: true, user })
  }
  
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedUser(null)
  }
  
  const roleLabels = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.MANAGER]: 'Gerente',
    [UserRole.SALESPERSON]: 'Vendedor',
  }
  
  const roleColors = {
    [UserRole.ADMIN]: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' },
    [UserRole.MANAGER]: { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' },
    [UserRole.SALESPERSON]: { backgroundColor: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' },
  }
  
  const columns = [
    {
      id: 'name',
      label: 'Nome',
    },
    {
      id: 'email',
      label: 'Email',
    },
    {
      id: 'role',
      label: 'Perfil',
      format: (value: unknown) => (
        <Chip
          label={roleLabels[value as UserRole]}
          size="small"
          sx={{
            ...roleColors[value as UserRole],
            fontWeight: 600,
            borderRadius: '8px',
          }}
        />
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: unknown) => (
        <Chip
          label={value ? 'Ativo' : 'Bloqueado'}
          size="small"
          sx={{
            backgroundColor: value ? '#D1FAE5' : '#FEE2E2',
            color: value ? '#065F46' : '#991B1B',
            fontWeight: 600,
            borderRadius: '8px',
            border: value ? '1px solid #10B981' : '1px solid #EF4444',
          }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Criado em',
      format: (value: unknown) => format(new Date(value as string), 'dd/MM/yyyy'),
    },
  ]
  
  return (
    <Box sx={{ backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      <PageHeader
        title="Usuários"
        subtitle={`Total de usuários: ${stats?.total || 0}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Usuários' },
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
            Novo Usuário
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
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nome ou email..."
                sx={{ 
                  minWidth: 300,
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
                <InputLabel>Perfil</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                  label="Perfil"
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
                  <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                  <MenuItem value={UserRole.MANAGER}>Gerente</MenuItem>
                  <MenuItem value={UserRole.SALESPERSON}>Vendedor</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target.value
                    setStatusFilter(value === '' ? '' : value === 'true')
                  }}
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
                  <MenuItem value="true">Ativos</MenuItem>
                  <MenuItem value="false">Bloqueados</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      
      {/* Data Table */}
      <Box sx={{ px: 3 }}>
        <DataTable<UserResponse>
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
              icon: <KeyIcon />,
              label: 'Resetar Senha',
              onClick: handleResetPassword,
            },
            {
              icon: <BlockIcon />,
              label: 'Bloquear',
              onClick: handleBlock,
              color: 'error',
              show: (row) => row.isActive,
            },
          ]}
          getRowId={(row) => row.id}
        />
      </Box>
      
      <UserModal
        open={openModal}
        onClose={handleCloseModal}
        user={selectedUser}
      />
      
      {resetPasswordModal.user && (
        <ResetPasswordModal
          open={resetPasswordModal.open}
          onClose={() => setResetPasswordModal({ open: false, user: null })}
          user={resetPasswordModal.user}
        />
      )}
      
      <ConfirmDialog
        open={blockDialog.open}
        title="Bloquear Usuário"
        message={`Tem certeza que deseja bloquear o usuário "${blockDialog.user?.name}"?`}
        type="warning"
        onConfirm={() => {
          if (blockDialog.user) {
            blockMutation.mutate({
              id: blockDialog.user.id,
              reason: 'Bloqueado pelo administrador',
            })
          }
        }}
        onCancel={() => setBlockDialog({ open: false, user: null })}
        loading={blockMutation.isPending}
      />
    </Box>
  )
}
