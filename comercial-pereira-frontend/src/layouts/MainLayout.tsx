import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
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

  return (
    <Box sx={{ display: "flex", backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)`,
          ml: `${sidebarOpen ? drawerWidth : 0}px`,
          transition: "width 0.3s, margin 0.3s",
          backgroundColor: 'white',
          borderBottom: '1px solid #E2E8F0',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleSidebar}
            edge="start"
            sx={{ 
              mr: 2,
              color: '#64748B',
              '&:hover': {
                backgroundColor: '#F1F5F9'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <TextField
            placeholder="Search product"
            variant="outlined"
            size="small"
            sx={{
              width: 300,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#E2E8F0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4F46E5',
                  borderWidth: '2px',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton 
            sx={{ 
              mr: 2,
              color: '#64748B',
              position: 'relative',
              '&:hover': {
                backgroundColor: '#F1F5F9'
              }
            }}
          >
            <Badge 
              badgeContent={4} 
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: '20px',
                  height: '20px',
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'right', mr: 2, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {user?.role === UserRole.ADMIN ? 'Admin' : 
                 user?.role === UserRole.MANAGER ? 'Manager' : 'Vendedor'}
              </Typography>
            </Box>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                '&:hover': {
                  backgroundColor: '#F1F5F9'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: '#4F46E5',
                  fontWeight: 600,
                  fontSize: '16px'
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
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0',
                mt: 1,
              }
            }}
          >
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#F8FAFC'
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#64748B' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#1E293B', fontWeight: 500 }}>
                {user?.name}
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#F8FAFC'
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
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
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
            borderRight: '1px solid #E2E8F0',
            transform: sidebarOpen
              ? "translateX(0)"
              : `translateX(-${drawerWidth}px)`,
            transition: "transform 0.3s",
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
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                CP
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
              Comercial Pereira
            </Typography>
          </Box>
          
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              color: '#64748B',
              '&:hover': {
                backgroundColor: '#F1F5F9'
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ px: 2, py: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#94A3B8', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              px: 2,
              mb: 1,
              display: 'block'
            }}
          >
            GENERAL
          </Typography>
          
          <List sx={{ p: 0 }}>
            {filteredMenuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
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
                      ...(index === 0 && {
                        backgroundColor: '#F0F4FF',
                        '&:hover': {
                          backgroundColor: '#E0E7FF',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#4F46E5',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#4F46E5',
                          fontWeight: 600,
                        }
                      }),
                      ...((index !== 0) && {
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#64748B',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#475569',
                          fontWeight: 500,
                        }
                      })
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
                        <ExpandLess sx={{ color: '#64748B' }} />
                      ) : (
                        <ExpandMore sx={{ color: '#64748B' }} />
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
                            }
                          }}
                          onClick={() => navigate(child.path)}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.text}
                            primaryTypographyProps={{
                              fontSize: '14px',
                              color: '#64748B',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Tools Section */}
        <Box sx={{ px: 2, mt: 4 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#94A3B8', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              px: 2,
              mb: 1,
              display: 'block'
            }}
          >
            TOOLS
          </Typography>
          
          <List sx={{ p: 0 }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                sx={{
                  borderRadius: '12px',
                  mx: 1,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#F8FAFC',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#64748B' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Account & Settings"
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

        {/* User Info at Bottom */}
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                backgroundColor: '#4F46E5',
                mr: 2,
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {user?.role === UserRole.ADMIN ? 'Admin' : 
                 user?.role === UserRole.MANAGER ? 'Manager' : 'Vendedor'}
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
          backgroundColor: '#F8FAFC',
          marginLeft: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: "margin 0.3s",
          mt: '80px',
          minHeight: 'calc(100vh - 80px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
