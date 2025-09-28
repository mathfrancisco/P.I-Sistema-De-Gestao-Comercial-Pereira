import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  Inventory,
  Warning,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import inventoryService from '../../services/api/inventory.service'
import userService from '../../services/api/user.service'
import { UserRole } from '../../types/enums'

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    isUp: boolean
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth()
  
  // Queries para estatísticas
  const { data: inventoryStats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryService.getStatistics(),
    enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
  })
  
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getStatistics(),
    enabled: hasRole([UserRole.ADMIN]),
  })
  
  const { data: lowStockProducts } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: () => inventoryService.getLowStockAlert(),
    enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
  })
  
  // Dados mockados para gráficos (substituir com dados reais)
  const salesData = [
    { name: 'Jan', vendas: 4000 },
    { name: 'Fev', vendas: 3000 },
    { name: 'Mar', vendas: 5000 },
    { name: 'Abr', vendas: 4500 },
    { name: 'Mai', vendas: 6000 },
    { name: 'Jun', vendas: 5500 },
  ]
  
  const categoryData = [
    { name: 'Eletrônicos', value: 400 },
    { name: 'Roupas', value: 300 },
    { name: 'Alimentos', value: 300 },
    { name: 'Outros', value: 200 },
  ]
  
  const statCards: StatCard[] = [
    {
      title: 'Total de Vendas',
      value: 'R$ 45.231,89',
      icon: <ShoppingCart />,
      color: '#4caf50',
      trend: { value: 12.5, isUp: true },
    },
    {
      title: 'Produtos em Estoque',
      value: inventoryStats?.totalProducts || 0,
      icon: <Inventory />,
      color: '#2196f3',
    },
    {
      title: 'Usuários no Sistema',
      value: userStats?.totalUsers || 0,
      icon: <People />,
      color: '#ff9800',
      trend: { value: 3.2, isUp: true },
    },
    {
      title: 'Produtos com Estoque Baixo',
      value: inventoryStats?.lowStockCount || 0,
      icon: <Warning />,
      color: '#f44336',
    },
  ]
  
  // Dashboard para Vendedor
  if (user?.role === UserRole.SALESPERSON) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard - Vendedor
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Suas Vendas Hoje
                </Typography>
                <Typography variant="h5">R$ 2.431,00</Typography>
                <Typography variant="body2" color="success.main">
                  +15% vs ontem
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Vendas do Mês
                </Typography>
                <Typography variant="h5">R$ 18.231,00</Typography>
                <LinearProgress variant="determinate" value={65} sx={{ mt: 1 }} />
                <Typography variant="caption">65% da meta</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Clientes Atendidos
                </Typography>
                <Typography variant="h5">47</Typography>
                <Typography variant="body2" color="textSecondary">
                  Este mês
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Ticket Médio
                </Typography>
                <Typography variant="h5">R$ 387,45</Typography>
                <Typography variant="body2" color="error.main">
                  -5% vs mês passado
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Suas Vendas Recentes
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>JD</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="João da Silva"
                    secondary="R$ 543,00 - Há 30 minutos"
                  />
                  <Chip label="Concluída" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>MA</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Maria Aparecida"
                    secondary="R$ 234,00 - Há 1 hora"
                  />
                  <Chip label="Concluída" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>PC</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Pedro Costa"
                    secondary="R$ 892,00 - Há 2 horas"
                  />
                  <Chip label="Pendente" color="warning" size="small" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Clientes do Mês
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="1. Maria Silva" secondary="R$ 2.341,00" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="2. João Santos" secondary="R$ 1.892,00" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="3. Ana Costa" secondary="R$ 1.543,00" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="4. Pedro Lima" secondary="R$ 1.234,00" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="5. Carlos Souza" secondary="R$ 987,00" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }
  
  // Dashboard para Admin e Manager
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard Geral
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                    {card.trend && (
                      <Box display="flex" alignItems="center" mt={1}>
                        {card.trend.isUp ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={card.trend.isUp ? 'success.main' : 'error.main'}
                          ml={0.5}
                        >
                          {card.trend.value}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vendas Mensais
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vendas"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vendas por Categoria
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {lowStockProducts && lowStockProducts.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="error">
                ⚠️ Produtos com Estoque Baixo
              </Typography>
              <List>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id}>
                    <ListItemText
                      primary={product.productName}
                      secondary={`Código: ${product.productCode}`}
                    />
                    <Box textAlign="right">
                      <Typography variant="h6" color="error">
                        {product.currentQuantity}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Mínimo: {product.minQuantity}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}