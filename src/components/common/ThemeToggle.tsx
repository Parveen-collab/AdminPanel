import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, Divider, Box } from '@mui/material';
import { Brightness4, Brightness7, Settings } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#1976d2', '#2e7d32', '#d32f2f', '#7b1fa2', '#ed6c02', '#0097a7'];

export const ThemeToggle: React.FC = () => {
  const { mode, setMode, primaryColor, setPrimaryColor } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMode = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <Brightness7 />;
      case 'dark':
        return <Brightness4 />;
      case 'system':
        return <Settings />;
      default:
        return <Brightness7 />;
    }
  };

  return (
    <>
      <Tooltip title="Theme & Color">
        <IconButton onClick={handleClick} color="inherit">
          {getIcon()}
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleSelectMode('light')} selected={mode === 'light'}>
          Light Mode
        </MenuItem>
        <MenuItem onClick={() => handleSelectMode('dark')} selected={mode === 'dark'}>
          Dark Mode
        </MenuItem>
        <MenuItem onClick={() => handleSelectMode('system')} selected={mode === 'system'}>
          System Default
        </MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1 }}>
          {COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => setPrimaryColor(c)}
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: c,
                cursor: 'pointer',
                border: c === primaryColor ? '2px solid #fff' : '2px solid transparent',
                boxShadow: c === primaryColor ? 3 : 0,
              }}
              title={c}
            />
          ))}
        </Box>
      </Menu>
    </>
  );
};

