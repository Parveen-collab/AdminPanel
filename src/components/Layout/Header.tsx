import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Stack } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const email = (typeof window !== 'undefined' && localStorage.getItem('email')) || '';
  const initial = email ? email.charAt(0).toUpperCase() : 'A';

  return (
    <AppBar position="sticky" elevation={0} color="transparent" sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeToggle />
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{initial}</Avatar>
          <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
            {email}
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

