import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
    Button,
    Avatar,
    Divider,
} from "@mui/material";
import {
    TrendingUp,
    People,
    ShoppingCart,
    Inventory,
    Warning,
    Category as CategoryIcon,
    LocalShipping,
    Assessment,
    ArrowForward,
    CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import inventoryService from "../../services/api/inventory.service";
import userService from "../../services/api/user.service";
import categoryService from "../../services/api/category.service";
import supplierService from "../../services/api/supplier.service";
import customerService from "../../services/api/customer.service";
import saleService from "../../services/api/sale.service";
import { UserRole, SaleStatus } from "../../types/enums";

export const Dashboard: React.FC = () => {
    const { user, hasRole } = useAuth();

    // ====== QUERIES PARA ADMIN/MANAGER ======
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

    const { data: categoryStats } = useQuery({
        queryKey: ["category-stats"],
        queryFn: () => categoryService.getStatistics(),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    const { data: supplierStats } = useQuery({
        queryKey: ["supplier-stats"],
        queryFn: () => supplierService.getStatistics(),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    const { data: lowStockProducts } = useQuery({
        queryKey: ["low-stock-products"],
        queryFn: () => inventoryService.getLowStockAlert(),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    const { data: allCustomers } = useQuery({
        queryKey: ["customers-count"],
        queryFn: () => customerService.findAll({ page: 0, size: 1 }),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    const { data: completedSales } = useQuery({
        queryKey: ["sales-completed"],
        queryFn: () => saleService.findAll({
            status: SaleStatus.COMPLETED,
            page: 0,
            size: 1000
        }),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    const { data: allSalesCount } = useQuery({
        queryKey: ["sales-count"],
        queryFn: () => saleService.findAll({ page: 0, size: 1 }),
        enabled: hasRole([UserRole.ADMIN, UserRole.MANAGER]),
    });

    // ====== QUERIES PARA VENDEDOR ======
    const { data: mySales } = useQuery({
        queryKey: ["my-sales", user?.id],
        queryFn: () => saleService.findAll({ userId: user?.id, page: 0, size: 1000 }),
        enabled: user?.role === UserRole.SALESPERSON && !!user?.id,
    });

    const { data: recentSales } = useQuery({
        queryKey: ["recent-sales", user?.id],
        queryFn: () =>
            saleService.findAll({
                userId: user?.id,
                page: 0,
                size: 10,
                sortBy: "saleDate",
                sortOrder: "desc"
            }),
        enabled: user?.role === UserRole.SALESPERSON && !!user?.id,
    });

    // ====== CÁLCULOS ======
    const calculateTodaySales = () => {
        if (!mySales?.content) return 0;
        const today = new Date().toDateString();
        return mySales.content
            .filter((sale) => new Date(sale.saleDate).toDateString() === today)
            .reduce((sum, sale) => sum + sale.total, 0);
    };

    const calculateMonthSales = () => {
        if (!mySales?.content) return 0;
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return mySales.content
            .filter((sale) => new Date(sale.saleDate) >= firstDay)
            .reduce((sum, sale) => sum + sale.total, 0);
    };

    const calculateTotalRevenue = () => {
        if (!completedSales?.content) return 0;
        return completedSales.content.reduce((sum, sale) => sum + sale.total, 0);
    };

    const calculateCustomersServed = () => {
        if (!mySales?.content) return 0;
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const uniqueCustomers = new Set(
            mySales.content
                .filter((sale) => new Date(sale.saleDate) >= firstDay)
                .map((sale) => sale.customer.id)
        );
        return uniqueCustomers.size;
    };

    const calculateAverageTicket = () => {
        if (!mySales?.content || mySales.content.length === 0) return 0;
        const total = mySales.content.reduce((sum, sale) => sum + sale.total, 0);
        return total / mySales.content.length;
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);

    // ====== DASHBOARD VENDEDOR ======
    if (user?.role === UserRole.SALESPERSON) {
        const todaySales = calculateTodaySales();
        const monthSales = calculateMonthSales();
        const customersServed = calculateCustomersServed();
        const averageTicket = calculateAverageTicket();
        const monthGoal = 30000;
        const goalProgress = (monthSales / monthGoal) * 100;

        return (
            <Box sx={{
                p: { xs: 2, sm: 3 },
                backgroundColor: "#F8FAFC",
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }
            }}>
                {/* Header Section */}
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: "#0F172A",
                                    letterSpacing: '-0.02em',
                                    mb: 0.5
                                }}
                            >
                                Olá, {user.name.split(' ')[0]}!
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#64748B", fontWeight: 500 }}>
                                Acompanhe seu desempenho em tempo real
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Card Principal - Vendas Hoje */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                borderRadius: "20px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 150,
                                    height: 150,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <ShoppingCart sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Chip
                                        icon={<TrendingUp sx={{ fontSize: 18 }} />}
                                        label="+12%"
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                            color: 'white',
                                            fontWeight: 700,
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                                    {formatCurrency(todaySales)}
                                </Typography>
                                <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: '1rem', mb: 2 }}>
                                    Vendas Hoje
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#10B981'
                                    }} />
                                    <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                                        {mySales?.content.filter(
                                            (sale) =>
                                                new Date(sale.saleDate).toDateString() ===
                                                new Date().toDateString()
                                        ).length || 0} transações realizadas
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Vendas do Mês */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card sx={{
                            borderRadius: "20px",
                            border: "1px solid #E2E8F0",
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)',
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        backgroundColor: '#EEF2FF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Assessment sx={{ fontSize: 28, color: '#6366F1' }} />
                                    </Box>
                                </Box>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                                >
                                    {formatCurrency(monthSales)}
                                </Typography>
                                <Typography sx={{ color: "#64748B", fontWeight: 600, mb: 3, fontSize: '0.95rem' }}>
                                    Vendas do Mês
                                </Typography>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                            Meta: {formatCurrency(monthGoal)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700 }}>
                                            {goalProgress.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(goalProgress, 100)}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: "#E0E7FF",
                                            "& .MuiLinearProgress-bar": {
                                                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                                                borderRadius: 5,
                                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                                            },
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Clientes Atendidos */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card sx={{
                            borderRadius: "20px",
                            border: "1px solid #E2E8F0",
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)',
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        backgroundColor: '#ECFDF5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <People sx={{ fontSize: 28, color: '#10B981' }} />
                                    </Box>
                                    <Chip
                                        label="Este mês"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#ECFDF5',
                                            color: '#059669',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                                >
                                    {customersServed}
                                </Typography>
                                <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: '0.95rem' }}>
                                    Clientes Atendidos
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Ticket Médio */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card sx={{
                            borderRadius: "20px",
                            border: "1px solid #E2E8F0",
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)',
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        backgroundColor: '#FEF3C7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <TrendingUp sx={{ fontSize: 28, color: '#F59E0B' }} />
                                    </Box>
                                </Box>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                                >
                                    {formatCurrency(averageTicket)}
                                </Typography>
                                <Typography sx={{ color: "#64748B", fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
                                    Ticket Médio
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                                    Baseado em {mySales?.content.length || 0} vendas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Performance Card */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card sx={{
                            borderRadius: "20px",
                            border: "1px solid #E2E8F0",
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            height: '100%',
                            background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                                    }}>
                                        <Assessment sx={{ fontSize: 24, color: 'white' }} />
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: "#0F172A", flex: 1 }}
                                    >
                                        Performance do Mês
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: '16px',
                                    p: 2.5,
                                    mb: 3,
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                            Meta
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                                            {formatCurrency(monthGoal)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                            Realizado
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#6366F1" }}>
                                            {formatCurrency(monthSales)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                            Faltam
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#EF4444" }}>
                                            {formatCurrency(Math.max(0, monthGoal - monthSales))}
                                        </Typography>
                                    </Box>
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(goalProgress, 100)}
                                    sx={{
                                        height: 14,
                                        borderRadius: 7,
                                        backgroundColor: "#E0E7FF",
                                        mb: 2,
                                        "& .MuiLinearProgress-bar": {
                                            background:
                                                goalProgress >= 100
                                                    ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                                                    : goalProgress >= 75
                                                        ? "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)"
                                                        : goalProgress >= 50
                                                            ? "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)"
                                                            : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
                                            borderRadius: 7,
                                            boxShadow: goalProgress >= 75 ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                                        },
                                    }}
                                />

                                <Box sx={{
                                    textAlign: 'center',
                                    p: 2,
                                    backgroundColor: goalProgress >= 100 ? '#ECFDF5' : '#EEF2FF',
                                    borderRadius: '12px',
                                    border: `1px solid ${goalProgress >= 100 ? '#D1FAE5' : '#E0E7FF'}`
                                }}>
                                    {goalProgress >= 100 ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>
                                                Parabéns! Meta atingida!
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 600 }}>
                                            {(100 - goalProgress).toFixed(1)}% restante para atingir a meta
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Vendas Recentes */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card sx={{
                            borderRadius: "20px",
                            border: "1px solid #E2E8F0",
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            height: '100%'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 3,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            backgroundColor: '#EEF2FF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <ShoppingCart sx={{ fontSize: 24, color: '#6366F1' }} />
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 700, color: "#0F172A" }}
                                        >
                                            Vendas Recentes
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="text"
                                        endIcon={<ArrowForward />}
                                        size="small"
                                        sx={{
                                            color: "#6366F1",
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#EEF2FF'
                                            }
                                        }}
                                        href="/sales"
                                    >
                                        Ver Todas
                                    </Button>
                                </Box>
                                {recentSales?.content && recentSales.content.length > 0 ? (
                                    <List sx={{ p: 0 }}>
                                        {recentSales.content.slice(0, 5).map((sale, index) => (
                                            <React.Fragment key={sale.id}>
                                                <ListItem
                                                    sx={{
                                                        px: 0,
                                                        py: 2.5,
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '12px',
                                                        '&:hover': {
                                                            backgroundColor: '#F8FAFC',
                                                            transform: 'translateX(4px)'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '12px',
                                                        backgroundColor: '#EEF2FF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 2,
                                                        fontWeight: 700,
                                                        color: '#6366F1',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        #{sale.id}
                                                    </Box>
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}
                                                            >
                                                                {sale.customer.name}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                                                                {formatCurrency(sale.total)} • {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Chip
                                                        label={
                                                            sale.status === SaleStatus.COMPLETED
                                                                ? "Concluída"
                                                                : sale.status === SaleStatus.PENDING
                                                                    ? "Pendente"
                                                                    : "Cancelada"
                                                        }
                                                        sx={{
                                                            backgroundColor:
                                                                sale.status === SaleStatus.COMPLETED
                                                                    ? "#ECFDF5"
                                                                    : sale.status === SaleStatus.PENDING
                                                                        ? "#FEF3C7"
                                                                        : "#FEE2E2",
                                                            color:
                                                                sale.status === SaleStatus.COMPLETED
                                                                    ? "#059669"
                                                                    : sale.status === SaleStatus.PENDING
                                                                        ? "#D97706"
                                                                        : "#DC2626",
                                                            fontWeight: 700,
                                                            borderRadius: "10px",
                                                            fontSize: '0.8rem',
                                                            height: 32
                                                        }}
                                                    />
                                                </ListItem>
                                                {index < recentSales.content.slice(0, 5).length - 1 && (
                                                    <Divider sx={{ my: 0 }} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: "center", py: 8 }}>
                                        <ShoppingCart sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                                            Nenhuma venda registrada ainda
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#CBD5E1", mt: 1 }}>
                                            Suas vendas aparecerão aqui
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // ====== DASHBOARD ADMIN/MANAGER ======
    const totalRevenue = calculateTotalRevenue();

    return (
        <Box sx={{
            p: 3,
            backgroundColor: "#F8FAFC",
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
            '&::before': {
                content: '""',
                position: 'absolute',
                top: -100,
                left: -100,
                width: 400,
                height: 400,
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
            }
        }}>
            <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                >
                    Painel de Controle
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748B", fontWeight: 500 }}>
                    Visão geral do sistema
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Receita Total */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card
                        sx={{
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                            color: "white",
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)',
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 150,
                                height: 150,
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                            }
                        }}
                    >
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 3,
                                }}
                            >
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <ShoppingCart sx={{ fontSize: 28 }} />
                                </Box>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                                {formatCurrency(totalRevenue)}
                            </Typography>
                            <Typography sx={{ opacity: 0.9, fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                                Receita Total
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#10B981'
                                }} />
                                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                                    {completedSales?.content?.length || 0} vendas concluídas
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total de Clientes */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: '#ECFDF5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <People sx={{ fontSize: 32, color: '#10B981' }} />
                                </Box>
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                            >
                                {allCustomers?.totalElements || 0}
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: '0.95rem' }}>
                                Total de Clientes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total de Vendas */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: '#FEF3C7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Assessment sx={{ fontSize: 32, color: '#F59E0B' }} />
                                </Box>
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                            >
                                {allSalesCount?.totalElements || 0}
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: '0.95rem' }}>
                                Total de Vendas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total de Produtos */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: '#FEE2E2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Inventory sx={{ fontSize: 32, color: '#EF4444' }} />
                                </Box>
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 800, color: "#0F172A", mb: 1, letterSpacing: '-0.02em' }}
                            >
                                {inventoryStats?.totalProducts || 0}
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: '0.95rem' }}>
                                Total de Produtos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cards Secundários */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '14px',
                                    backgroundColor: '#EEF2FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}>
                                    <CategoryIcon sx={{ color: "#4F46E5", fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: '-0.02em' }}
                                    >
                                        {categoryStats?.total || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                        Categorias
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600 }}>
                                {categoryStats?.active || 0} ativas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '14px',
                                    backgroundColor: '#FEF3C7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}>
                                    <LocalShipping sx={{ color: "#F59E0B", fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: '-0.02em' }}
                                    >
                                        {supplierStats?.total || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                        Fornecedores
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600 }}>
                                {supplierStats?.active || 0} ativos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '14px',
                                    backgroundColor: '#ECFDF5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}>
                                    <TrendingUp sx={{ color: "#10B981", fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: '-0.02em' }}
                                    >
                                        {formatCurrency(inventoryStats?.totalValue || 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                        Valor em Estoque
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '14px',
                                    backgroundColor: '#F5F3FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}>
                                    <People sx={{ color: "#7C3AED", fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: '-0.02em' }}
                                    >
                                        {userStats?.total || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                                        Usuários
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600 }}>
                                {userStats?.active || 0} ativos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Alerta de Estoque Baixo */}
                {lowStockProducts && lowStockProducts.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Card
                            sx={{
                                borderRadius: "20px",
                                border: "1px solid #FEE2E2",
                                backgroundColor: "#FEF2F2",
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        backgroundColor: '#FEE2E2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <Warning sx={{ color: "#DC2626", fontSize: 28 }} />
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: "#DC2626", flex: 1 }}
                                    >
                                        Produtos com Estoque Baixo ({lowStockProducts.length})
                                    </Typography>
                                </Box>
                                <List sx={{ p: 0 }}>
                                    {lowStockProducts.slice(0, 5).map((product, index) => (
                                        <React.Fragment key={product.id}>
                                            <ListItem sx={{ px: 0, py: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    backgroundColor: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}>
                                                    <Inventory sx={{ color: '#DC2626', fontSize: 24 }} />
                                                </Box>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{ fontWeight: 700, color: "#0F172A" }}
                                                        >
                                                            {product.product.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                                                            Código: {product.product.code}
                                                        </Typography>
                                                    }
                                                />
                                                <Box sx={{ textAlign: "right" }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ fontWeight: 800, color: "#DC2626" }}
                                                    >
                                                        {product.quantity}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                                                        Mínimo: {product.minStock}
                                                    </Typography>
                                                </Box>
                                            </ListItem>
                                            {index < lowStockProducts.slice(0, 5).length - 1 && (
                                                <Divider />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                                {lowStockProducts.length > 5 && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            mt: 2,
                                            backgroundColor: '#DC2626',
                                            color: 'white',
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: '#B91C1C'
                                            }
                                        }}
                                        href="/inventory"
                                    >
                                        Ver todos os {lowStockProducts.length} produtos
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};