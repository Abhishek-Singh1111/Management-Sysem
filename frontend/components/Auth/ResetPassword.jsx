import { useState } from 'react';
import { Alert, Button, Paper, TextField, Typography, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        navigate('/login');
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Choose a new password</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField fullWidth required type="password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth required type="password" label="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>Update password</Button>
            </form>
            <Link component={RouterLink} to="/login" variant="body2">Back to sign in</Link>
        </Paper>
    );
};

export default ResetPassword;
