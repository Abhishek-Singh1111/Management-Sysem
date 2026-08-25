import { useState } from 'react';
import { Alert, Button, Paper, TextField, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Reset password</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Enter your email address and we will send reset instructions.
            </Typography>
            {submitted && <Alert severity="info" sx={{ mb: 2 }}>If an account exists, reset instructions will be sent shortly.</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField fullWidth required type="email" label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>Send reset link</Button>
            </form>
            <Link component={RouterLink} to="/login" variant="body2">Back to sign in</Link>
        </Paper>
    );
};

export default ForgotPassword;
