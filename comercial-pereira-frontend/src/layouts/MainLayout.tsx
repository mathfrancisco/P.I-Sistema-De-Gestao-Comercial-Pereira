import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Collapse,
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore,
  Store as StoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/ui.store";
import { UserRole } from "../types/enums";

const drawerWidth = 280;

interface MenuItemConfig {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
  children?: MenuItemConfig[];
}

const menuItems: MenuItemConfig[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESPERSON],
  },
  {
    text: "Vendas",
    icon: <ShoppingCartIcon />,
    path: "/sales",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESPERSON],
  },
  {
    text: "Clientes",
    icon: <PeopleIcon />,
    path: "/customers",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESPERSON],
  },
  {
    text: "Produtos",
    icon: <StoreIcon />,
    path: "/products",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: "Estoque",
    icon: <InventoryIcon />,
    path: "/inventory",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: "Fornecedores",
    icon: <BusinessIcon />,
    path: "/suppliers",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: "Categorias",
    icon: <CategoryIcon />,
    path: "/categories",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: "Usuários",
    icon: <PersonIcon />,
    path: "/users",
    roles: [UserRole.ADMIN],
  },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, canAccess } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleSubmenuClick = (text: string) => {
    setOpenSubmenu(openSubmenu === text ? null : text);
  };

  const filteredMenuItems = menuItems.filter((item) => canAccess(item.roles));

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)`,
          ml: `${sidebarOpen ? drawerWidth : 0}px`,
          transition: "width 0.3s ease-in-out, margin 0.3s ease-in-out",
          backgroundColor: 'white',
          borderBottom: '1px solid #E3F2FD',
          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ py: 1.5, px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleSidebar}
            edge="start"
            sx={{ 
              mr: 3,
              color: '#64748B',
              borderRadius: '12px',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: '#EBF8FF',
                color: '#3B82F6',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <TextField
            placeholder="Buscar produtos, clientes..."
            variant="outlined"
            size="medium"
            sx={{
              width: 350,
              mr: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                height: '44px',
                fontSize: '14px',
                fontWeight: 500,
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
              '& .MuiInputBase-input': {
                color: '#1E293B',
                '&::placeholder': {
                  color: '#94A3B8',
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#60A5FA', fontSize: '20px' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton 
            sx={{ 
              mr: 3,
              color: '#64748B',
              borderRadius: '12px',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: '#EBF8FF',
                color: '#3B82F6',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Badge 
              badgeContent={4} 
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              textAlign: 'right', 
              mr: 2, 
              display: { xs: 'none', sm: 'block' },
              minWidth: 0,
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: '#1E293B', 
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: 1.2,
              }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 500,
              }}>
                {user?.role === UserRole.ADMIN ? 'Administrador' : 
                 user?.role === UserRole.MANAGER ? 'Gerente' : 'Vendedor'}
              </Typography>
            </Box>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: '#EBF8FF',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  fontWeight: 700,
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
                border: '1px solid #E3F2FD',
                mt: 1.5,
                minWidth: 200,
              }
            }}
          >
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: '#EBF8FF'
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#3B82F6' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                Meu Perfil
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: '#EBF8FF'
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#64748B' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                Configurações
              </Typography>
            </MenuItem>
            <Divider sx={{ my: 1, borderColor: '#E3F2FD' }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                px: 2,
                color: '#DC2626',
                '&:hover': {
                  backgroundColor: '#FEF2F2'
                }
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" sx={{ color: '#DC2626' }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 500 }}>
                Sair
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: 'white',
            borderRight: '1px solid #E3F2FD',
            boxShadow: '4px 0 20px rgba(59, 130, 246, 0.08)',
            transform: sidebarOpen
              ? "translateX(0)"
              : `translateX(-${drawerWidth}px)`,
            transition: "transform 0.3s ease-in-out",
          },
        }}
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 3,
            borderBottom: '1px solid #E3F2FD',
            background: 'linear-gradient(135deg, #FAFBFF 0%, #F8FAFC 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                CP
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#1E293B',
                fontSize: '16px',
                lineHeight: 1.2,
              }}>
                Comercial Pereira
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748B',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                Sistema de Gestão
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              color: '#64748B',
              borderRadius: '10px',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: '#EBF8FF',
                color: '#3B82F6',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ px: 2, py: 3, flex: 1, overflow: 'auto' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#94A3B8', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              px: 2,
              mb: 2,
              display: 'block',
              fontSize: '11px',
            }}
          >
            NAVEGAÇÃO
          </Typography>
          
          <List sx={{ p: 0 }}>
            {filteredMenuItems.map((item, index) => {
              const isActive = isActiveRoute(item.path);
              
              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => {
                        if (item.children) {
                          handleSubmenuClick(item.text);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      sx={{
                        borderRadius: '12px',
                        mx: 1,
                        py: 1.5,
                        px: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        ...(isActive && {
                          backgroundColor: '#EBF8FF',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: '#3B82F6',
                            borderRadius: '0 4px 4px 0',
                          },
                          '&:hover': {
                            backgroundColor: '#DBEAFE',
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#3B82F6',
                          },
                          '& .MuiListItemText-primary': {
                            color: '#1E40AF',
                            fontWeight: 600,
                          }
                        }),
                        ...(!isActive && {
                          '&:hover': {
                            backgroundColor: '#F8FAFC',
                            transform: 'translateX(4px)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#64748B',
                          },
                          '& .MuiListItemText-primary': {
                            color: '#475569',
                            fontWeight: 500,
                          }
                        }),
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '14px',
                        }}
                      />
                      {item.children &&
                        (openSubmenu === item.text ? (
                          <ExpandLess sx={{ color: isActive ? '#3B82F6' : '#64748B' }} />
                        ) : (
                          <ExpandMore sx={{ color: isActive ? '#3B82F6' : '#64748B' }} />
                        ))}
                    </ListItemButton>
                  </ListItem>

                  {item.children && (
                    <Collapse
                      in={openSubmenu === item.text}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItemButton
                            key={child.text}
                            sx={{ 
                              pl: 6,
                              py: 1,
                              borderRadius: '12px',
                              mx: 1,
                              '&:hover': {
                                backgroundColor: '#F8FAFC',
                                transform: 'translateX(4px)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                            onClick={() => navigate(child.path)}
                          >
                            <ListItemIcon sx={{ minWidth: 40, color: '#94A3B8' }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={child.text}
                              primaryTypographyProps={{
                                fontSize: '13px',
                                color: '#64748B',
                                fontWeight: 500,
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>

          {/* Tools Section */}
          <Box sx={{ mt: 4 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#94A3B8', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                px: 2,
                mb: 2,
                display: 'block',
                fontSize: '11px',
              }}
            >
              FERRAMENTAS
            </Typography>
            
            <List sx={{ p: 0 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#64748B' }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Configurações"
                    primaryTypographyProps={{
                      fontSize: '14px',
                      color: '#475569',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>

        {/* User Info at Bottom */}
        <Box sx={{ p: 2, borderTop: '1px solid #E3F2FD', backgroundColor: '#FAFBFF' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            backgroundColor: 'white', 
            borderRadius: '12px',
            border: '1px solid #E3F2FD',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)',
          }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                mr: 2,
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ 
                color: '#1E293B', 
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748B',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                {user?.role === UserRole.ADMIN ? 'Administrador' : 
                 user?.role === UserRole.MANAGER ? 'Gerente' : 'Vendedor'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#FAFBFF',
          marginLeft: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: "margin 0.3s ease-in-out",
          mt: '80px',
          minHeight: 'calc(100vh - 80px)',
          position: 'relative',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};