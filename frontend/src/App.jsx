// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

// Layout Components
import Layout from '../components/Layout/Layout';
import PublicLayout from '../components/Layout/PublicLayout';

// Auth Pages
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import ForgotPassword from '../components/Auth/ForgotPassword';
import ResetPassword from '../components/Auth/ResetPassword';

// Main Pages
import Dashboard from '../components/pages/Dashboard';
import Items from '../components/pages/Items';
import Expenses from '../components/pages/Expenses';
import Budget from '../components/pages/Budget';
import Reports from '../components/pages/Reports';
import Profile from '../components/pages/Profile';
import Settings from '../components/pages/Settings';
import NotFound from '../components/pages/NotFound';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes (No Authentication Required) */}
                        <Route element={<PublicLayout />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                        </Route>

                        {/* Protected Routes (Authentication Required) */}
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/items" element={<Items />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="/budget" element={<Budget />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Admin Only Routes */}
                        <Route element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
                            <Route path="/admin/users" element={<div>User Management</div>} />
                            <Route path="/admin/settings" element={<div>Admin Settings</div>} />
                        </Route>

                        {/* 404 Not Found */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;