import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { Dashboard, People, Logout, MonetizationOn, Analytics, LocalOffer, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const DESKTOP_DRAWER_WIDTH = 260;
const DESKTOP_DRAWER_WIDTH_COLLAPSED = 72;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'User Management', icon: <People />, path: '/users' },
    { text: 'Subscriptions', icon: <MonetizationOn />, path: '/subscriptions' },
    { text: 'Promo Codes', icon: <LocalOffer />, path: '/promo-codes' },
    { text: 'Customer Analytics', icon: <Analytics />, path: '/customers/analytics' },
    { text: 'Sales Analytics', icon: <TrendingUp />, path: '/sales-analytics' },
    { text: 'Inactive Users', path: '/inactive-users', icon: <TrendingDown /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const width = collapsed ? DESKTOP_DRAWER_WIDTH_COLLAPSED : DESKTOP_DRAWER_WIDTH;

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, textAlign: collapsed ? 'center' : 'left' }}>
        <Typography variant="h6" fontWeight="bold" noWrap>
          {collapsed ? 'Admin' : 'Admin Panel'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={selected}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'inherit' },
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, mr: collapsed ? 0 : 1 }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, mr: collapsed ? 0 : 1 }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DESKTOP_DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRight: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open
      sx={{
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 200ms ease',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRight: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

