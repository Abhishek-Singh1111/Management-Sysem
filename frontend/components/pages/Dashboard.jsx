// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
    Alert,
    CircularProgress,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    AccountBalance as BudgetIcon,
} from '@mui/icons-material';
import { getItems } from '../../services/api';
import { getFinanceData, subscribeToFinanceData } from '../../services/financeStorage';
import { useAuth } from '../../context/AuthContext';
import { studentFundAPI } from '../../services/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const userId = user?.id;
    // State for items
    const [items, setItems] = useState([]);
    const [finance, setFinance] = useState(() => getFinanceData(userId));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for student funds
    const [studentSummary, setStudentSummary] = useState(null);
    const [semesterSummary, setSemesterSummary] = useState([]);
    const [departmentSummary, setDepartmentSummary] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            try {
                // Load items data
                const itemsResponse = await getItems();
                if (active) {
                    setItems(itemsResponse.data.data || []);
                }

                // Load student fund data
                try {
                    const [summary, semester, department] = await Promise.all([
                        studentFundAPI.getSummary(),
                        studentFundAPI.getSummaryBySemester(),
                        studentFundAPI.getSummaryByDepartment()
                    ]);
                    
                    if (active) {
                        const summaryData = summary.data.data;
                        setStudentSummary(summaryData ? {
                            ...summaryData,
                            total_students: Number(summaryData.total_students || 0),
                            total_fund_required: Number(summaryData.total_fund_required || 0),
                            total_fund_collected: Number(summaryData.total_fund_collected || 0),
                            total_fund_pending: Number(summaryData.total_fund_pending || 0),
                            paid_students: Number(summaryData.paid_students || 0),
                            pending_students: Number(summaryData.pending_students || 0),
                        } : null);
                        setSemesterSummary((semester.data.data || []).map(item => ({
                            ...item,
                            total_fund_collected: Number(item.total_fund_collected || 0),
                            total_fund_pending: Number(item.total_fund_pending || 0),
                        })));
                        setDepartmentSummary((department.data.data || []).map(item => ({
                            ...item,
                            total_fund_collected: Number(item.total_fund_collected || 0),
                            total_fund_pending: Number(item.total_fund_pending || 0),
                        })));
                    }
                } catch (studentError) {
                    console.error('Error loading student fund data:', studentError);
                    // Don't show error for student data if it's not critical
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                    setLoadingStudents(false);
                }
            }
        };

        Promise.resolve().then(loadData);
        const unsubscribe = subscribeToFinanceData(() => setFinance(getFinanceData(userId)));
        return () => {
            active = false;
            unsubscribe();
        };
    }, [userId]);

    // Calculate item statistics
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const budgetLeft = finance.budget - totalValue;
    const purchasedItems = items.filter(item => item.purchased).length;
    const pendingItems = items.filter(item => !item.purchased).length;

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading && loadingStudents) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Items Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Items
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        {items.length}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip 
                                            label={`${purchasedItems} Purchased`} 
                                            size="small" 
                                            color="success" 
                                        />
                                        <Chip 
                                            label={`${pendingItems} Pending`} 
                                            size="small" 
                                            color="warning" 
                                        />
                                    </Box>
                                </Box>
                                <InventoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Item Value Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Item Value
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        ₹{totalValue.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Total Quantity: {totalQuantity}
                                    </Typography>
                                </Box>
                                <MoneyIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Party Fund Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Party Fund
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        ₹{finance.budget.toFixed(2)}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color={budgetLeft < 0 ? 'error' : 'success.main'}
                                        sx={{ mt: 1 }}
                                    >
                                        {budgetLeft < 0 ? 'Over Budget' : 'Budget Left'}: ₹{Math.abs(budgetLeft).toFixed(2)}
                                    </Typography>
                                </Box>
                                <BudgetIcon sx={{ fontSize: 40, color: '#ed6c02' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Students Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Students
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        {studentSummary?.total_students || 0}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip 
                                            label={`${studentSummary?.paid_students || 0} Paid`} 
                                            size="small" 
                                            color="success" 
                                        />
                                        <Chip 
                                            label={`${studentSummary?.pending_students || 0} Pending`} 
                                            size="small" 
                                            color="error" 
                                        />
                                    </Box>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Budget Progress */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Budget Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                            Spent: ₹{totalValue.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Budget: ₹{finance.budget.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Remaining: ₹{Math.max(budgetLeft, 0).toFixed(2)}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={finance.budget > 0 ? Math.min((totalValue / finance.budget) * 100, 100) : 0}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: budgetLeft < 0 ? '#d32f2f' : '#1976d2',
                            },
                        }}
                    />
                </Box>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Total Items
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {items.length}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Total Students
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {studentSummary?.total_students || 0}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Student Fund Collected
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                            ₹{(studentSummary?.total_fund_collected || 0).toFixed(2)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Student Fund Pending
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="error.main">
                            ₹{(studentSummary?.total_fund_pending || 0).toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Charts Section */}
            <Paper sx={{ p: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Items Analysis" />
                    <Tab label="Student Funds Analysis" />
                </Tabs>

                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Items by Category
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(
                                                items.reduce((acc, item) => {
                                                    const category = item.category || 'Uncategorized';
                                                    acc[category] = (acc[category] || 0) + Number(item.total_price || 0);
                                                    return acc;
                                                }, {})
                                            ).map(([name, value]) => ({ name, value }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {Object.entries(
                                                items.reduce((acc, item) => {
                                                    const category = item.category || 'Uncategorized';
                                                    acc[category] = (acc[category] || 0) + Number(item.total_price || 0);
                                                    return acc;
                                                }, {})
                                            ).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Items Status
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                name: 'Purchased',
                                                count: purchasedItems,
                                                value: items.filter(item => item.purchased).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
                                            },
                                            {
                                                name: 'Pending',
                                                count: pendingItems,
                                                value: items.filter(item => !item.purchased).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
                                            }
                                        ]}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
                                        <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Value (₹)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Funds by Semester
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={semesterSummary}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="semester_name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="total_fund_collected" fill="#82ca9d" name="Collected" />
                                        <Bar dataKey="total_fund_pending" fill="#ff8042" name="Pending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Funds by Department
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={departmentSummary}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="department_name" />
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="total_fund_collected" fill="#8884d8" name="Collected" />
                                        <Bar dataKey="total_fund_pending" fill="#ffc658" name="Pending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Student Fund Summary
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Students
                                        </Typography>
                                        <Typography variant="h6">
                                            {studentSummary?.total_students || 0}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Required
                                        </Typography>
                                        <Typography variant="h6">
                                            ₹{(studentSummary?.total_fund_required || 0).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary" sx={{ color: 'success.main' }}>
                                            Total Collected
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            ₹{(studentSummary?.total_fund_collected || 0).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary" sx={{ color: 'error.main' }}>
                                            Total Pending
                                        </Typography>
                                        <Typography variant="h6" color="error.main">
                                            ₹{(studentSummary?.total_fund_pending || 0).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Collection Rate
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={studentSummary?.total_fund_required ? 
                                                    (studentSummary.total_fund_collected / studentSummary.total_fund_required) * 100 : 0
                                                }
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            {studentSummary?.total_fund_required ? 
                                                ((studentSummary.total_fund_collected / studentSummary.total_fund_required) * 100).toFixed(1) : 0
                                            }%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Box>
    );
};

export default Dashboard;