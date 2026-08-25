import { Paper, Typography } from '@mui/material';

const Expenses = () => (
    <>
        <Typography variant="h4" gutterBottom>Expenses</Typography>
        <Paper sx={{ p: 3 }}><Typography color="text.secondary">Review and manage party expenses here.</Typography></Paper>
    </>
);

export default Expenses;
