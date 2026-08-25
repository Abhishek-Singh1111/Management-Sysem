// components/Layout/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';

const PublicLayout = () => {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.default'
        }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
                <Container maxWidth="sm">
                    <Outlet />
                </Container>
            </Box>
            <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} Party Fund Manager. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default PublicLayout;