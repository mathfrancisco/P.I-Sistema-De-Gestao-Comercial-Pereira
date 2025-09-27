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
  VpnKey as KeyIcon,
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
    [UserRole.ADMIN]: 'error' as const,
    [UserRole.MANAGER]: 'warning' as const,
    [UserRole.SALESPERSON]: 'info' as const,
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
          color={roleColors[value as UserRole]}
          size="small"
        />
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      format: (value: unknown) => (
        <Chip
          label={value ? 'Ativo' : 'Bloqueado'}
          color={value ? 'success' : 'error'}
          size="small"
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
    <Box>
      <PageHeader
        title="Usuários"
        subtitle={`Total de usuários: ${stats?.total || 0}`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Novo Usuário
          </Button>
        }
      />
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou email..."
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Perfil</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            label="Perfil"
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
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Ativos</MenuItem>
            <MenuItem value="false">Bloqueados</MenuItem>
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
            onClick: (row) => handleEdit(row as unknown as UserResponse),
          },
          {
            icon: <KeyIcon />,
            label: 'Resetar Senha',
            onClick: (row) => handleResetPassword(row as unknown as UserResponse),
          },
          {
            icon: <BlockIcon />,
            label: 'Bloquear',
            onClick: (row) => handleBlock(row as unknown as UserResponse),
            color: 'error',
            show: (row) => (row as unknown as UserResponse).isActive,
          },
        ]}
        getRowId={(row) => (row as unknown as UserResponse).id}
      />
      
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