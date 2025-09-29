import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material'
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchField } from '../../components/common/SearchField'
import { StatusChip } from '../../components/common/StatusChip'
import { StockAdjustmentModal } from '../../components/modals/StockAdjustmentModal'
import { DataTable } from '../../components/tables/DataTable'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import inventoryService from '../../services/api/inventory.service'
import type { InventoryResponse } from '../../types/dto/inventory.dto'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export const InventoryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<string>('')
  const [adjustmentModal, setAdjustmentModal] = useState<{
    open: boolean
    inventory: InventoryResponse | null
  }>({ open: false, inventory: null })
  
  const debouncedSearch = useDebounce(search, 500)
  const pagination = usePagination()
  
  // Query para estatísticas
  const { data: stats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryService.getStatistics(),
  })
  
  // Query para inventário
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', debouncedSearch, stockFilter, pagination.paginationProps],
    queryFn: () =>
      inventoryService.findMany({
        search: debouncedSearch,
        lowStock: stockFilter === 'low' || undefined,
        outOfStock: stockFilter === 'out' || undefined,
        hasStock: stockFilter === 'ok' || undefined,
        ...pagination.paginationProps,
      }),
  })
  
  // Query para alertas
  const { data: lowStockProducts } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: () => inventoryService.getLowStockAlert(),
    enabled: tabValue === 1,
  })
  
  const { data: outOfStockProducts } = useQuery({
    queryKey: ['inventory-out-stock'],
    queryFn: () => inventoryService.getOutOfStockProducts(),
    enabled: tabValue === 1,
  })
  
  const handleAdjustStock = (inventory: InventoryResponse) => {
    setAdjustmentModal({ open: true, inventory })
  }

    const columns = [
        {
            id: 'product.code',  // ← Acessa via notação de ponto
            label: 'Código',
            width: 100,
        },
        {
            id: 'product.name',  // ← Acessa via notação de ponto
            label: 'Produto',
        },
        {
            id: 'quantity',  // ← Campo direto
            label: 'Qtd. Atual',
            numeric: true,
        },
        {
            id: 'minStock',  // ← Campo direto
            label: 'Qtd. Mínima',
            numeric: true,
            format: (value: number | null) => value || '-',
        },
        {
            id: 'maxStock',  // ← Campo direto
            label: 'Qtd. Máxima',
            numeric: true,
            format: (value: number | null) => value || '-',
        },
        {
            id: 'location',
            label: 'Localização',
            format: (value: string | null) => value || '-',
        },
        {
            id: 'status',
            label: 'Status',
            format: (value: string) => <StatusChip status={value} type="inventory" />,
        },
    ];
  
  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats?.totalProducts || 0,
      icon: <CheckIcon />,
      color: '#4caf50',
    },
    {
      title: 'Valor Total em Estoque',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(stats?.totalValue || 0),
      icon: <TrendingUpIcon />,
      color: '#2196f3',
    },
    {
      title: 'Produtos com Estoque Baixo',
      value: stats?.lowStockCount || 0,
      icon: <WarningIcon />,
      color: '#ff9800',
    },
    {
      title: 'Produtos Sem Estoque',
      value: stats?.outOfStockCount || 0,
      icon: <ErrorIcon />,
      color: '#f44336',
    },
  ]
  
  return (
    <Box>
      <PageHeader
        title="Gestão de Estoque"
        subtitle="Controle e monitore seu inventário"
      />
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      color: card.color,
                      fontSize: 40,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Inventário" />
          <Tab label="Alertas" />
          <Tab label="Movimentações" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar produto..."
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Status</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Filtrar por Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ok">Com Estoque</MenuItem>
                <MenuItem value="low">Estoque Baixo</MenuItem>
                <MenuItem value="out">Sem Estoque</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <DataTable<InventoryResponse>
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
              label: 'Ajustar Estoque',
              icon: <EditIcon />,
              onClick: handleAdjustStock,
            },
          ]}
          getRowId={(row) => row.id}
        />
      </TabPanel>

        <TabPanel value={tabValue} index={1}>
            {lowStockProducts && lowStockProducts.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Produtos com Estoque Baixo
                    </Typography>
                    {lowStockProducts.map((product) => (
                        <Box key={product.id} sx={{ mb: 1 }}>
                            <Typography>
                                <strong>{product.product.name}</strong> -
                                Estoque: {product.quantity} /
                                Mínimo: {product.minStock}
                            </Typography>
                        </Box>
                    ))}
                </Alert>
            )}

            {outOfStockProducts && outOfStockProducts.length > 0 && (
                <Alert severity="error">
                    <Typography variant="h6" gutterBottom>
                        Produtos Sem Estoque
                    </Typography>
                    {outOfStockProducts.map((product) => (
                        <Box key={product.id} sx={{ mb: 1 }}>
                            <Typography>
                                <strong>{product.product.name}</strong> -
                                Código: {product.product.code}
                            </Typography>
                        </Box>
                    ))}
                </Alert>
            )}
        </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography>Movimentações do Estoque</Typography>
        {/* Implementar tabela de movimentações */}
      </TabPanel>
      
      {adjustmentModal.inventory && (
        <StockAdjustmentModal
          open={adjustmentModal.open}
          onClose={() => setAdjustmentModal({ open: false, inventory: null })}
          inventory={adjustmentModal.inventory}
        />
      )}
    </Box>
  )
}