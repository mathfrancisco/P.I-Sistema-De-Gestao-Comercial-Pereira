import React from "react";
import { useQuery } from "@tanstack/react-query";
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
  Button,
  IconButton,
} from "@mui/material";
import {
  TrendingUp,
  People,
  ShoppingCart,
  Inventory,
  Warning,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import inventoryService from "../../services/api/inventory.service";
import userService from "../../services/api/user.service";
import { UserRole } from "../../types/enums";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Queries para estatísticas
  const { data: inventoryStats } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => inventoryService.getStatistics(),
    enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
  });

  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => userService.getStatistics(),
    enabled: hasRole([UserRole.ADMIN]),
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: () => inventoryService.getLowStockAlert(),
    enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
  });

  // Dados mockados para gráficos (substituir com dados reais)
  const salesData = [
    { name: "Jan", vendas: 4000, meta: 4500 },
    { name: "Fev", vendas: 3000, meta: 4500 },
    { name: "Mar", vendas: 5000, meta: 4500 },
    { name: "Abr", vendas: 4500, meta: 4500 },
    { name: "Mai", vendas: 6000, meta: 4500 },
    { name: "Jun", vendas: 5500, meta: 4500 },
  ];

  const categoryData = [
    { name: "Eletrônicos", value: 400 },
    { name: "Roupas", value: 300 },
    { name: "Alimentos", value: 300 },
    { name: "Outros", value: 200 },
  ];

  const statCards: StatCard[] = [
    {
      title: "Total Revenue",
      value: "R$ 45.231,89",
      icon: <ShoppingCart />,
      color: "#4F46E5",
      trend: { value: 12.5, isUp: true },
    },
    {
      title: "Total Customer",
      value: userStats?.totalUsers || 5000,
      icon: <People />,
      color: "#10B981",
      trend: { value: 1.5, isUp: true },
    },
    {
      title: "Total Transactions",
      value: "12.000",
      icon: <TrendingUp />,
      color: "#F59E0B",
      trend: { value: 3.6, isUp: true },
    },
    {
      title: "Total Product",
      value: inventoryStats?.totalProducts || 5000,
      icon: <Inventory />,
      color: "#EF4444",
      trend: { value: 1.5, isUp: false },
    },
  ];

  // Dashboard para Vendedor
  if (user?.role === UserRole.SALESPERSON) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1E293B", mb: 1 }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748B" }}>
            Vendedor - Acompanhe seu desempenho
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    R$ 2.431
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowUpward sx={{ fontSize: "20px" }} />
                    <Typography
                      variant="body2"
                      sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                      15%
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Suas Vendas Hoje
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  From last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "#1E293B" }}
                  >
                    18.231
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      borderRadius: "12px",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowUpward sx={{ fontSize: "16px" }} />
                    <Typography
                      variant="caption"
                      sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                      1.5%
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: "#64748B", fontWeight: 500, mb: 1 }}>
                  Vendas do Mês
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#E2E8F0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#4F46E5",
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: "#64748B", mt: 1 }}>
                  65% da meta
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "#1E293B" }}
                  >
                    47
                  </Typography>
                  <IconButton size="small" sx={{ color: "#94A3B8" }}>
                    <MoreVert />
                  </IconButton>
                </Box>
                <Typography sx={{ color: "#64748B", fontWeight: 500 }}>
                  Clientes Atendidos
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8", mt: 1 }}>
                  Este mês
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "#1E293B" }}
                  >
                    387
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#FEF2F2",
                      color: "#DC2626",
                      borderRadius: "12px",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowDownward sx={{ fontSize: "16px" }} />
                    <Typography
                      variant="caption"
                      sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                      5%
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: "#64748B", fontWeight: 500 }}>
                  Ticket Médio
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8", mt: 1 }}>
                  From last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#1E293B" }}
                  >
                    Suas Vendas Recentes
                  </Typography>
                  <Button variant="text" size="small" sx={{ color: "#4F46E5" }}>
                    Show All
                  </Button>
                </Box>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "#4F46E5", width: 48, height: 48 }}
                      >
                        JD
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1E293B" }}
                        >
                          João da Silva
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          R$ 543,00 - Há 30 minutos
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                    <Chip
                      label="Success"
                      sx={{
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                        fontWeight: 600,
                        borderRadius: "8px",
                      }}
                      size="small"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "#10B981", width: 48, height: 48 }}
                      >
                        MA
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1E293B" }}
                        >
                          Maria Aparecida
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          R$ 234,00 - Há 1 hora
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                    <Chip
                      label="Success"
                      sx={{
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                        fontWeight: 600,
                        borderRadius: "8px",
                      }}
                      size="small"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "#F59E0B", width: 48, height: 48 }}
                      >
                        PC
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1E293B" }}
                        >
                          Pedro Costa
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          R$ 892,00 - Há 2 horas
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                    <Chip
                      label="Pending"
                      sx={{
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        fontWeight: 600,
                        borderRadius: "8px",
                      }}
                      size="small"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Customers */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#1E293B", mb: 3 }}
                >
                  Top Clientes do Mês
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {[
                    { name: "Maria Silva", value: "R$ 2.341,00" },
                    { name: "João Santos", value: "R$ 1.892,00" },
                    { name: "Ana Costa", value: "R$ 1.543,00" },
                    { name: "Pedro Lima", value: "R$ 1.234,00" },
                    { name: "Carlos Souza", value: "R$ 987,00" },
                  ].map((customer, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1E293B" }}
                            >
                              {index + 1}. {customer.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#4F46E5", fontWeight: 600 }}
                            >
                              {customer.value}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Dashboard para Admin e Manager
  return (
    <Box sx={{ p: 3, backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#1E293B", mb: 1 }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748B" }}>
          Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
                ...(index === 0 && {
                  background:
                    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                  color: "white",
                }),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        color: index === 0 ? "white" : "#1E293B",
                        mb: 1,
                      }}
                    >
                      {index === 0 ? "$81.000" : card.value}
                    </Typography>
                    {card.trend && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {card.trend.isUp ? (
                          <ArrowUpward
                            sx={{
                              fontSize: "16px",
                              color: index === 0 ? "white" : "#10B981",
                            }}
                          />
                        ) : (
                          <ArrowDownward
                            sx={{ fontSize: "16px", color: "#EF4444" }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            ml: 0.5,
                            fontWeight: 600,
                            color:
                              index === 0
                                ? "white"
                                : card.trend.isUp
                                ? "#10B981"
                                : "#EF4444",
                          }}
                        >
                          {card.trend.value}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    sx={{
                      color: index === 0 ? "rgba(255,255,255,0.7)" : "#94A3B8",
                      backgroundColor:
                        index === 0 ? "rgba(255,255,255,0.1)" : "transparent",
                      "&:hover": {
                        backgroundColor:
                          index === 0 ? "rgba(255,255,255,0.2)" : "#F1F5F9",
                      },
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                <Typography
                  sx={{
                    color: index === 0 ? "rgba(255,255,255,0.9)" : "#64748B",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: index === 0 ? "rgba(255,255,255,0.7)" : "#94A3B8",
                  }}
                >
                  From last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Sales Target Progress */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1E293B", mb: 1 }}
              >
                Sales Target
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
                In Progress
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#1E293B" }}
                  >
                    $231.032.444
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    Sales Target: $500.000,00
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={46}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#E2E8F0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#4F46E5",
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Increase Sales Card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
                Increase your sales
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, mb: 3, maxWidth: "60%" }}
              >
                Discover the Proven Methods to Skyrocket Your Sales! Unleash the
                Potential of Your Business and Achieve Remarkable Growth.
                Whether you're a seasoned entrepreneur or just starting out
              </Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#1E293B" }}
                >
                  Your Sales this year
                </Typography>
                <Button variant="text" size="small" sx={{ color: "#4F46E5" }}>
                  Show All
                </Button>
              </Box>

              {/* Legend */}
              <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#F59E0B",
                      borderRadius: 1,
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    Average Sale Value
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#4F46E5",
                      borderRadius: 1,
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    Average Item per sale
                  </Typography>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient
                      id="colorVendas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fill="url(#colorVendas)"
                  />
                  <Line
                    type="monotone"
                    dataKey="meta"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1E293B", mb: 3 }}
              >
                Vendas por Categoria
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent as number) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Popular Table */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#1E293B" }}
                >
                  Product Popular
                </Typography>
                <Button variant="text" size="small" sx={{ color: "#4F46E5" }}>
                  Show All
                </Button>
              </Box>

              {/* Table Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: 2,
                  p: 2,
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#64748B" }}
                >
                  Product
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#64748B" }}
                >
                  Price
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#64748B" }}
                >
                  Sales
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#64748B" }}
                >
                  Status
                </Typography>
              </Box>

              {/* Table Rows */}
              {[
                {
                  name: "Kanky Kitadakate (Green)",
                  code: "021231",
                  price: "$20.00",
                  sales: 3000,
                },
                {
                  name: "Kanky Kitadakate (Blue)",
                  code: "021232",
                  price: "$20.00",
                  sales: 2311,
                },
                {
                  name: "Kanky Kitadakate (Red)",
                  code: "021233",
                  price: "$20.00",
                  sales: 2111,
                },
                {
                  name: "Kanky Kitadakate (Yellow)",
                  code: "021234",
                  price: "$20.00",
                  sales: 1661,
                },
              ].map((product, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 2,
                    p: 2,
                    alignItems: "center",
                    borderBottom: index === 3 ? "none" : "1px solid #E2E8F0",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: "#F1F5F9",
                        borderRadius: "8px",
                        mr: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        IMG
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1E293B" }}
                      >
                        {product.code}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {product.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1E293B" }}
                  >
                    {product.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    {product.sales}
                  </Typography>
                  <Chip
                    label="Success"
                    sx={{
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      fontWeight: 600,
                      borderRadius: "8px",
                      width: "fit-content",
                    }}
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alert */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #FECACA",
                backgroundColor: "#FEF2F2",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Warning sx={{ color: "#DC2626", mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#DC2626" }}
                  >
                    Produtos com Estoque Baixo
                  </Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <ListItem key={product.id} sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: "#1E293B" }}
                          >
                            {product.productName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: "#64748B" }}>
                            Código: {product.productCode}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#DC2626" }}
                        >
                          {product.currentQuantity}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          Mínimo: {product.minQuantity}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
