// components/Common/Navbar.jsx
import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Box,
    Badge,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Logout,
    Person,
    Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const Navbar = ({ handleDrawerToggle, drawerWidth }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationOpen = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleSettings = () => {
        handleMenuClose();
        navigate('/settings');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, minWidth: 0, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
    <Box component="span" sx={{ color: 'primary.main', display: { xs: 'none', sm: 'inline' }, mr: 1 }}>
    Vaishno Group
  </Box>
  Party Fund Manager
</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton 
                            color="inherit" 
                            onClick={handleNotificationOpen}
                            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                        >
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            {user?.full_name || user?.username}
                        </Typography>
                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                sx={{ 
                                    ml: 1,
                                    border: '2px solid',
                                    borderColor: 'primary.main'
                                }}
                            >
                                <Avatar 
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                >
                                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* User Menu Dropdown */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <Person sx={{ mr: 2 }} /> Profile
                        </MenuItem>
                        <MenuItem onClick={handleSettings}>
                            <Settings sx={{ mr: 2 }} /> Settings
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 2 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem>No new notifications</MenuItem>
            </Menu>
        </AppBar>
    );
};

export default Navbar;