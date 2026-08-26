// src/components/studentFunds/PaymentStatusUpdate.jsx
import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Chip,
    Divider,
} from '@mui/material';
import { studentFundAPI } from '../../services/endpoints';
import { useNotification } from '../../hooks/useNotification';

const PaymentStatusUpdate = ({ fund, onSuccess, onCancel }) => {
    const [paymentData, setPaymentData] = useState({
        paid_amount: fund?.paid_amount || 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: fund?.payment_method || '',
        transaction_id: fund?.transaction_id || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { showNotification } = useNotification();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parseFloat(paymentData.paid_amount) > parseFloat(fund.fund_amount)) {
            setError('Paid amount cannot exceed total fund amount');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await studentFundAPI.updatePayment(fund.id, {
                ...paymentData,
                paid_amount: parseFloat(paymentData.paid_amount),
            });
            showNotification('Payment status updated successfully', 'success');
            onSuccess();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const maxPaid = parseFloat(fund?.fund_amount || 0);
    const currentPaid = parseFloat(fund?.paid_amount || 0);
    const remaining = maxPaid - currentPaid;

    return (
        <Box sx={{ p: 2 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Total Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                            ₹{maxPaid.toFixed(2)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Paid
                        </Typography>
                        <Typography variant="h6" color="success.main">
                            ₹{currentPaid.toFixed(2)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Remaining
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                            ₹{remaining.toFixed(2)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" gutterBottom>
                Student: <strong>{fund?.student_name}</strong> ({fund?.student_id})
            </Typography>
            <Typography variant="body2" gutterBottom>
                Status: <Chip 
                    label={fund?.payment_status?.toUpperCase()} 
                    color={fund?.payment_status === 'paid' ? 'success' : fund?.payment_status === 'partial' ? 'warning' : 'error'}
                    size="small"
                />
            </Typography>

            <form onSubmit={handleSubmit}>
                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Paid Amount (₹)"
                            name="paid_amount"
                            type="number"
                            value={paymentData.paid_amount}
                            onChange={handleChange}
                            required
                            InputProps={{
                                inputProps: { 
                                    min: 0, 
                                    max: maxPaid,
                                    step: 0.01 
                                }
                            }}
                            helperText={`Maximum: ₹${maxPaid.toFixed(2)}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Payment Date"
                            name="payment_date"
                            type="date"
                            value={paymentData.payment_date}
                            onChange={handleChange}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Payment Method"
                            name="payment_method"
                            value={paymentData.payment_method}
                            onChange={handleChange}
                            placeholder="Cash, Bank Transfer, etc."
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Transaction ID"
                            name="transaction_id"
                            value={paymentData.transaction_id}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button variant="outlined" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        Update Payment
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default PaymentStatusUpdate;