import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const DESKTOP_DRAWER_WIDTH = 260;
const DESKTOP_DRAWER_WIDTH_COLLAPSED = 72;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const currentDrawerWidth = isMobile
    ? 0
    : collapsed
    ? DESKTOP_DRAWER_WIDTH_COLLAPSED
    : DESKTOP_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
      />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          onMenuClick={() => (isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed))}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            backgroundColor: 'background.default',
            transition: 'margin-left 200ms ease',
            ml: { xs: 0, md: `${currentDrawerWidth}px` },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

