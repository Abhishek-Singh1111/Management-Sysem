import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { AdminPanelSettings as AdminIcon, Person as MemberIcon } from '@mui/icons-material';
import { getUsers, updateUserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data.data || []);
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(loadUsers);
    }, []);

    const handleRoleChange = async (targetUser) => {
        const nextRole = targetUser.role === 'admin' ? 'member' : 'admin';
        setUpdatingId(targetUser.id);
        try {
            const response = await updateUserRole(targetUser.id, nextRole);
            setUsers((currentUsers) => currentUsers.map((currentUser) => (
                currentUser.id === targetUser.id ? response.data.data : currentUser
            )));
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to update user role.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                User Management
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Promote members to administrators or return administrators to member access.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((targetUser) => {
                            const isCurrentUser = targetUser.id === user?.id;
                            const isSuperAdmin = targetUser.role === 'super_admin';
                            const canChangeRole = !isCurrentUser && !isSuperAdmin && ['member', 'admin'].includes(targetUser.role);
                            return (
                                <TableRow key={targetUser.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{targetUser.full_name || targetUser.username}</Typography>
                                        <Typography variant="caption" color="text.secondary">@{targetUser.username}</Typography>
                                    </TableCell>
                                    <TableCell>{targetUser.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={targetUser.role === 'admin' || isSuperAdmin ? <AdminIcon /> : <MemberIcon />}
                                            label={targetUser.role.replace('_', ' ')}
                                            color={isSuperAdmin ? 'secondary' : targetUser.role === 'admin' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{targetUser.is_active ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={!canChangeRole || updatingId === targetUser.id}
                                            onClick={() => handleRoleChange(targetUser)}
                                        >
                                            {updatingId === targetUser.id ? 'Updating...' : targetUser.role === 'admin' ? 'Make Member' : 'Make Admin'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserManagement;
