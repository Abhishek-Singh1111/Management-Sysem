// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { getItems } from '../../services/api';
import { getFinanceData, subscribeToFinanceData } from '../../services/financeStorage';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const [items, setItems] = useState([]);
    const [finance, setFinance] = useState(() => getFinanceData(userId));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFinance(getFinanceData(userId));

        const loadItems = async () => {
            try {
                const response = await getItems();
                if (active) {
                    setItems(response.data.data || []);
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadItems();
        const unsubscribe = subscribeToFinanceData(() => setFinance(getFinanceData(userId)));
        return () => {
            active = false;
            unsubscribe();
        };
    }, [userId]);

    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const budgetLeft = finance.budget - totalValue;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Items</Typography>
                        <Typography variant="h3">{items.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Quantity</Typography>
                        <Typography variant="h3">{totalQuantity}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Item Value</Typography>
                        <Typography variant="h3">₹{totalValue.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Party Fund</Typography>
                        <Typography variant="h3">₹{finance.budget.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Budget Left</Typography>
                        <Typography variant="h3" color={budgetLeft < 0 ? 'error.main' : 'success.main'}>₹{budgetLeft.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default Dashboard;