// components/Layout/Layout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import NotificationHost from '../../hooks/NotificationHost';

const drawerWidth = 240;

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar 
                handleDrawerToggle={handleDrawerToggle} 
                drawerWidth={drawerWidth} 
            />
            <Sidebar 
                mobileOpen={mobileOpen} 
                handleDrawerToggle={handleDrawerToggle}
                drawerWidth={drawerWidth} 
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    mt: '64px' // AppBar height
                }}
            >
                <Outlet />
            </Box>
            <NotificationHost />
        </Box>
    );
};

export default Layout;