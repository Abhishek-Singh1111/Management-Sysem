import { useEffect, useState } from 'react';
import { Alert, Button, Paper, TextField, Typography } from '@mui/material';
import { getItems } from '../../services/api';
import { getFinanceData, saveFinanceData, subscribeToFinanceData } from '../../services/financeStorage';
import { useAuth } from '../../context/AuthContext';

const Budget = () => {
    const { user, isAdmin } = useAuth();
    const userId = user?.id;
    const [finance, setFinance] = useState(() => getFinanceData(userId));
    const [itemsTotal, setItemsTotal] = useState(0);
    const [budgetInput, setBudgetInput] = useState(String(finance.budget || ''));
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedFinance = getFinanceData(userId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFinance(storedFinance);
        setBudgetInput(String(storedFinance.budget || ''));
        const loadItems = async () => {
            try {
                const response = await getItems();
                setItemsTotal((response.data.data || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0));
            } catch {
                setMessage('Unable to load item costs.');
            }
        };
        loadItems();
        return subscribeToFinanceData(() => {
            const updatedFinance = getFinanceData(userId);
            setFinance(updatedFinance);
            setBudgetInput(String(updatedFinance.budget || ''));
        });
    }, [userId]);

    const handleSave = (event) => {
        event.preventDefault();
        const budget = Number(budgetInput);
        if (!Number.isFinite(budget) || budget < 0) {
            setMessage('Enter a valid non-negative budget.');
            return;
        }
        setFinance(saveFinanceData(userId, { ...finance, budget }));
        setMessage('Budget saved successfully.');
    };

    const remaining = finance.budget - itemsTotal;

    return (
        <>
            <Typography variant="h4" gutterBottom>Budget</Typography>
            <Paper component="form" onSubmit={handleSave} sx={{ p: 3, maxWidth: 640 }}>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Set the maximum fund available for party purchases.</Typography>
                {message && <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>{message}</Alert>}
                {isAdmin ? (
                    <>
                        <TextField fullWidth required label="Party budget" type="number" inputProps={{ min: 0, step: 0.01 }} value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} InputProps={{ startAdornment: '₹' }} />
                        <Button type="submit" variant="contained" sx={{ mt: 3 }}>Save budget</Button>
                    </>
                ) : (
                    <Typography>Only an admin or super admin can change the budget.</Typography>
                )}
            </Paper>
            <Paper sx={{ p: 3, mt: 3, maxWidth: 640 }}>
                <Typography>Planned item cost: ₹{itemsTotal.toFixed(2)}</Typography>
                <Typography variant="h5" color={remaining < 0 ? 'error.main' : 'success.main'} sx={{ mt: 1 }}>Budget left: ₹{remaining.toFixed(2)}</Typography>
            </Paper>
        </>
    );
};

export default Budget;
