import { Paper, Typography } from '@mui/material';

const Settings = () => (
    <>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Paper sx={{ p: 3 }}><Typography color="text.secondary">Application settings will appear here.</Typography></Paper>
    </>
);

export default Settings;
