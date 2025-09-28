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
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)`,
          ml: `${sidebarOpen ? drawerWidth : 0}px`,
          transition: "width 0.3s, margin 0.3s",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema Comercial Pereira
          </Typography>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              {user?.name}
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
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
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: [1],
          }}
        >
          <Typography variant="h6" noWrap>
            Menu
          </Typography>
          <IconButton onClick={toggleSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider />

        <List>
          {filteredMenuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.children) {
                      handleSubmenuClick(item.text);
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.children &&
                    (openSubmenu === item.text ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
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
                        sx={{ pl: 4 }}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          marginLeft: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: "margin 0.3s",
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
