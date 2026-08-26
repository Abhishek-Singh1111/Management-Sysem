// src/components/studentFunds/StudentFundForm.jsx
import { useState, useEffect, useCallback } from 'react';
import {
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import { studentFundAPI, departmentAPI, branchAPI, semesterAPI } from '../../services/endpoints';
import { useNotification } from '../../hooks/useNotification';

const getInitialFormData = (initialData) => ({
    student_name: initialData?.student_name || '',
    student_id: initialData?.student_id || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    semester_id: initialData?.semester_id || '',
    department_id: initialData?.department_id || '',
    branch_id: initialData?.branch_id || '',
    fund_amount: initialData?.fund_amount || '800',
    paid_amount: initialData?.paid_amount || '0',
    payment_method: initialData?.payment_method || '',
    transaction_id: initialData?.transaction_id || '',
    notes: initialData?.notes || '',
});

const StudentFundForm = ({ initialData, initialFilters, onSuccess, onCancel }) => {
    const formDefaults = initialData || initialFilters;
    const [formData, setFormData] = useState(() => getInitialFormData(formDefaults));
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showNotification } = useNotification();

    const fetchFormData = useCallback(async () => {
        try {
            const [depts, sems] = await Promise.all([
                departmentAPI.getAll(),
                semesterAPI.getAll()
            ]);
            setDepartments(depts.data.data || []);
            setSemesters(sems.data.data || []);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [showNotification]);

    const fetchBranches = useCallback(async (departmentId) => {
        if (!departmentId) {
            setBranches([]);
            return;
        }
        try {
            const response = await branchAPI.getByDepartment(departmentId);
            setBranches(response.data.data || []);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        Promise.resolve().then(fetchFormData);
        if (formDefaults?.department_id) {
            Promise.resolve().then(() => fetchBranches(formDefaults.department_id));
        }
    }, [fetchFormData, fetchBranches, formDefaults]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'department_id') {
            setFormData(prev => ({ ...prev, branch_id: '' }));
            fetchBranches(value);
        }
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.student_name.trim()) newErrors.student_name = 'Student name is required';
        if (!formData.student_id.trim()) newErrors.student_id = 'Student ID is required';
        if (!formData.semester_id) newErrors.semester_id = 'Semester is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
        if (!formData.fund_amount || parseFloat(formData.fund_amount) <= 0) {
            newErrors.fund_amount = 'Fund amount must be greater than 0';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const data = {
                ...formData,
                fund_amount: parseFloat(formData.fund_amount),
                paid_amount: parseFloat(formData.paid_amount) || 0,
            };

            if (initialData) {
                await studentFundAPI.update(initialData.id, data);
                showNotification('Student fund updated successfully', 'success');
            } else {
                await studentFundAPI.create(data);
                showNotification('Student fund created successfully', 'success');
            }
            onSuccess();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Student Name"
                        name="student_name"
                        value={formData.student_name}
                        onChange={handleChange}
                        error={!!errors.student_name}
                        helperText={errors.student_name}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Student ID"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        error={!!errors.student_id}
                        helperText={errors.student_id}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            name="semester_id"
                            value={formData.semester_id}
                            onChange={handleChange}
                            label="Semester"
                            error={!!errors.semester_id}
                            disabled={Boolean(initialFilters?.semester_id)}
                        >
                            <MenuItem value="">Select Semester</MenuItem>
                            {semesters.map((sem) => (
                                <MenuItem key={sem.id} value={sem.id}>
                                    {sem.semester_number ? `Semester ${sem.semester_number}` : sem.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.semester_id && (
                            <Typography variant="caption" color="error">
                                {errors.semester_id}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                        <InputLabel>Department</InputLabel>
                        <Select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            label="Department"
                            error={!!errors.department_id}
                            disabled={Boolean(initialFilters?.department_id)}
                        >
                            <MenuItem value="">Select Department</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.department_id && (
                            <Typography variant="caption" color="error">
                                {errors.department_id}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            name="branch_id"
                            value={formData.branch_id}
                            onChange={handleChange}
                            label="Branch"
                            disabled={Boolean(initialFilters?.branch_id) || !formData.department_id}
                            error={!!errors.branch_id}
                        >
                            <MenuItem value="">Select Branch</MenuItem>
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.branch_id && (
                            <Typography variant="caption" color="error">
                                {errors.branch_id}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Fund Amount (₹)"
                        name="fund_amount"
                        type="number"
                        value={formData.fund_amount}
                        onChange={handleChange}
                        error={!!errors.fund_amount}
                        helperText={errors.fund_amount}
                        required
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Paid Amount (₹)"
                        name="paid_amount"
                        type="number"
                        value={formData.paid_amount}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Payment Method"
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                        placeholder="Cash, Bank Transfer, etc."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Transaction ID"
                        name="transaction_id"
                        value={formData.transaction_id}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Notes"
                        name="notes"
                        multiline
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} />}
                        >
                            {initialData ? 'Update' : 'Create'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
};

export default StudentFundForm;