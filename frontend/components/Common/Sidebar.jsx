// components/Common/Sidebar.jsx
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Box,
    Typography,
    Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    // MoneyOff as ExpensesIcon,
    AccountBalanceWallet as BudgetIcon,
    // Assessment as ReportsIcon,
    Person as ProfileIcon,
    // Settings as SettingsIcon,
    People as UsersIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Items', icon: <InventoryIcon />, path: '/items' },
        // { text: 'Expenses', icon: <ExpensesIcon />, path: '/expenses' },
        { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
        // { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
        { divider: true },
        { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
        // { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ];

    // Admin only menu items
    if (user?.role === 'admin') {
        menuItems.push({ 
            text: 'Users', 
            icon: <UsersIcon />, 
            path: '/admin/users' 
        });
    }

    const drawer = (
        <div>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40
                        }}
                    >
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'P'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" noWrap>
                            {user?.full_name || user?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role || 'Member'}
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item, index) => {
                    if (item.divider) {
                        return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
                    }
                    
                    const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    
                    return (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            selected={isActive}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                                },
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                            }}
                        >
                            <ListItemIcon 
                                sx={{ 
                                    minWidth: 40,
                                    color: isActive ? 'white' : 'text.secondary'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    );
                })}
            </List>
            <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Version 1.0.0
                </Typography>
            </Box>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: { xs: 'min(86vw, 280px)', sm: drawerWidth },
                        bgcolor: 'background.paper'
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth,
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider'
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Sidebar;