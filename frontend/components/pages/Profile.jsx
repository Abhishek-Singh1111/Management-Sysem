import { Paper, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    return (
        <>
            <Typography variant="h4" gutterBottom>Profile</Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">{user?.full_name || user?.username || 'Your profile'}</Typography>
                <Typography color="text.secondary">{user?.email || 'Account details'}</Typography>
            </Paper>
        </>
    );
};

export default Profile;
