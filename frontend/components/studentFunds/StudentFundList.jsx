// src/components/studentFunds/StudentFundList.jsx
import { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    TextField,
    Button,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    CircularProgress,
    Grid,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Payment as PaymentIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { studentFundAPI, departmentAPI, branchAPI, semesterAPI } from '../../services/endpoints';
import { useNotification } from '../../hooks/useNotification';
import PaymentStatusUpdate from './PaymentStatusUpdate';
import StudentFundForm from './StudentFundForm';
import { jsPDF } from 'jspdf';

const getPaymentStatus = (fund) => {
    const fundAmount = Number(fund?.fund_amount || 0);
    const paidAmount = Number(fund?.paid_amount || 0);

    if (fundAmount > 0 && paidAmount >= fundAmount) return 'paid';
    if (paidAmount > 0) return 'partial';
    return 'pending';
};

const StudentFundList = () => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        semester_id: '',
        department_id: '',
        branch_id: '',
        payment_status: '',
        search: '',
    });
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedFund, setSelectedFund] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [summary, setSummary] = useState(null);
    const { showNotification } = useNotification();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [response, summaryResponse] = await Promise.all([
                studentFundAPI.getAll({
                    ...filters,
                }),
                studentFundAPI.getSummary({
                    semester_id: filters.semester_id,
                    department_id: filters.department_id,
                    branch_id: filters.branch_id,
                }),
            ]);
            setFunds(response.data.data || []);
            setSummary(summaryResponse.data.data || null);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, showNotification]);

    const fetchFiltersData = useCallback(async () => {
        try {
            const [depts, sems] = await Promise.all([
                departmentAPI.getAll(),
                semesterAPI.getAll()
            ]);
            setDepartments(depts.data.data || []);
            setSemesters(sems.data.data || []);
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    }, []);

    const fetchBranches = useCallback(async (departmentId) => {
        if (!departmentId) {
            setBranches([]);
            return;
        }
        try {
            const response = await branchAPI.getByDepartment(departmentId);
            setBranches(response.data.data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(fetchData);
    }, [fetchData]);

    useEffect(() => {
        Promise.resolve().then(fetchFiltersData);
    }, [fetchFiltersData]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        if (field === 'department_id') {
            setFilters(prev => ({ ...prev, branch_id: '' }));
            fetchBranches(value);
        }
    };

    const handleDelete = async () => {
        try {
            await studentFundAPI.delete(selectedFund.id);
            showNotification('Student fund deleted successfully', 'success');
            setShowDeleteDialog(false);
            fetchData();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleExportPdf = async () => {
        try {
            const response = await studentFundAPI.exportData(filters);
            const data = response.data.data || [];
            const document = new jsPDF({ orientation: 'landscape' });
            const date = new Date().toISOString().split('T')[0];
            let y = 18;

            document.setFontSize(16);
            document.text('Student Fund Report', 14, y);
            y += 9;
            document.setFontSize(9);
            document.text(`Semester: ${selectedSemester?.semester_number ? `Semester ${selectedSemester.semester_number}` : 'All'}`, 14, y);
            document.text(`Department: ${selectedDepartment?.name || 'All'}`, 90, y);
            document.text(`Branch: ${selectedBranch?.name || 'All'}`, 190, y);
            y += 7;
            document.text(`Students: ${summary?.total_students || data.length}`, 14, y);
            document.text(`Total assigned: Rs. ${Number(summary?.total_fund_required || 0).toFixed(2)}`, 90, y);
            document.text(`Collected: Rs. ${Number(summary?.total_fund_collected || 0).toFixed(2)}`, 190, y);
            y += 10;

            const columns = [
                { label: 'Student Name', x: 14 },
                { label: 'Student ID', x: 78 },
                { label: 'Semester', x: 120 },
                { label: 'Department', x: 155 },
                { label: 'Branch', x: 205 },
                { label: 'Amount', x: 250 },
                { label: 'Paid', x: 275 },
                { label: 'Status', x: 300 },
            ];
            const rowHeight = 7;

            const drawHeader = () => {
                document.setFillColor(25, 118, 210);
                document.rect(10, y - 5, 282, 8, 'F');
                document.setTextColor(255, 255, 255);
                document.setFontSize(8);
                columns.forEach(column => document.text(column.label, column.x, y));
                document.setTextColor(0, 0, 0);
                y += rowHeight;
            };

            drawHeader();
            data.forEach((fund) => {
                if (y > 195) {
                    document.addPage();
                    y = 18;
                    drawHeader();
                }
                document.setFontSize(7.5);
                document.text(String(fund.student_name || '-').slice(0, 28), 14, y);
                document.text(String(fund.student_id || '-').slice(0, 18), 78, y);
                document.text(String(fund.semester_name || '-').slice(0, 14), 120, y);
                document.text(String(fund.department_name || '-').slice(0, 18), 155, y);
                document.text(String(fund.branch_name || '-').slice(0, 16), 205, y);
                document.text(`Rs. ${Number(fund.fund_amount || 0).toFixed(2)}`, 250, y);
                document.text(`Rs. ${Number(fund.paid_amount || 0).toFixed(2)}`, 275, y);
                document.text(getPaymentStatus(fund).toUpperCase(), 300, y);
                y += rowHeight;
            });

            document.save(`student_funds_${date}.pdf`);
            showNotification('PDF created successfully', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'partial': return 'warning';
            case 'pending': return 'error';
            default: return 'default';
        }
    };

    const sortedFunds = [...funds].sort((firstFund, secondFund) => {
        const nameOrder = (firstFund.student_name || '').localeCompare(
            secondFund.student_name || '',
            undefined,
            { sensitivity: 'base' }
        );
        return nameOrder || String(firstFund.student_id || '').localeCompare(String(secondFund.student_id || ''));
    });

    const selectedSemester = semesters.find(semester => String(semester.id) === String(filters.semester_id));
    const selectedDepartment = departments.find(department => String(department.id) === String(filters.department_id));
    const selectedBranch = branches.find(branch => String(branch.id) === String(filters.branch_id));

    if (loading && funds.length === 0) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 1, sm: 2 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Student fund records
                </Typography>
                <Button variant="contained" onClick={() => setShowCreateDialog(true)}>
                    Add Student
                </Button>
            </Box>

            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Selected group fund summary
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Students
                        </Typography>
                        <Typography variant="h6">
                            {summary?.total_students || 0}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Total fund assigned
                        </Typography>
                        <Typography variant="h6">
                            ₹{Number(summary?.total_fund_required || 0).toFixed(2)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Fund collected
                        </Typography>
                        <Typography variant="h6" color="success.main">
                            ₹{Number(summary?.total_fund_collected || 0).toFixed(2)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Fund pending
                        </Typography>
                        <Typography variant="h6" color="error.main">
                            ₹{Number(summary?.total_fund_pending || 0).toFixed(2)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            variant="outlined"
                            size="small"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Name, ID, Email..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Semester</InputLabel>
                            <Select
                                value={filters.semester_id}
                                onChange={(e) => handleFilterChange('semester_id', e.target.value)}
                                label="Semester"
                            >
                                <MenuItem value="">All</MenuItem>
                                {semesters.map((sem) => (
                                    <MenuItem key={sem.id} value={sem.id}>
                                        {sem.semester_number ? `Semester ${sem.semester_number}` : sem.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filters.department_id}
                                onChange={(e) => handleFilterChange('department_id', e.target.value)}
                                label="Department"
                            >
                                <MenuItem value="">All</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Branch</InputLabel>
                            <Select
                                value={filters.branch_id}
                                onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                                label="Branch"
                                disabled={!filters.department_id}
                            >
                                <MenuItem value="">All</MenuItem>
                                {branches.map((branch) => (
                                    <MenuItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.payment_status}
                                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="partial">Partial</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <Tooltip title="Create PDF report">
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleExportPdf}
                                startIcon={<PdfIcon />}
                            >
                                Create PDF
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ display: { xs: 'block', sm: 'none' }, p: 1.5, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Selected group
                </Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Semester
                        </Typography>
                        <Typography variant="body2">
                            {selectedSemester?.semester_number ? `Semester ${selectedSemester.semester_number}` : 'All semesters'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Department
                        </Typography>
                        <Typography variant="body2">
                            {selectedDepartment?.name || 'All departments'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Branch
                        </Typography>
                        <Typography variant="body2">
                            {selectedBranch?.name || 'All branches'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Amount to be paid
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            ₹{Number(summary?.total_fund_required || 0).toFixed(2)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-root': { px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 } } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Student ID</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Semester</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Department</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Branch</TableCell>
                            <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Amount</TableCell>
                            <TableCell align="right">Amount Paid</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {funds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No student funds found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedFunds.map((fund) => (
                                <TableRow key={fund.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {fund.student_name}
                                        </Typography>
                                        {fund.email && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {fund.email}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{fund.student_id}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{fund.semester_name || '-'}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{fund.department_name || '-'}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{fund.branch_name || '-'}</TableCell>
                                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                        ₹{parseFloat(fund.fund_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                        ₹{parseFloat(fund.paid_amount || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPaymentStatus(fund).toUpperCase()}
                                            color={getStatusColor(getPaymentStatus(fund))}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Update Payment">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedFund(fund);
                                                    setShowPaymentDialog(true);
                                                }}
                                                color="primary"
                                            >
                                                <PaymentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedFund(fund);
                                                    setShowEditDialog(true);
                                                }}
                                                color="info"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedFund(fund);
                                                    setShowDeleteDialog(true);
                                                }}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Dialog */}
            <Dialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add Student Fund</DialogTitle>
                <DialogContent>
                    <StudentFundForm
                        initialFilters={{
                            semester_id: filters.semester_id,
                            department_id: filters.department_id,
                            branch_id: filters.branch_id,
                        }}
                        onSuccess={() => {
                            setShowCreateDialog(false);
                            fetchData();
                        }}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Student Fund</DialogTitle>
                <DialogContent>
                    <StudentFundForm
                        initialData={selectedFund}
                        onSuccess={() => {
                            setShowEditDialog(false);
                            fetchData();
                        }}
                        onCancel={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Payment Update Dialog */}
            <Dialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Payment Status</DialogTitle>
                <DialogContent>
                    <PaymentStatusUpdate
                        fund={selectedFund}
                        onSuccess={() => {
                            setShowPaymentDialog(false);
                            fetchData();
                        }}
                        onCancel={() => setShowPaymentDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the fund record for "{selectedFund?.student_name}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Student ID: {selectedFund?.student_id}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentFundList;