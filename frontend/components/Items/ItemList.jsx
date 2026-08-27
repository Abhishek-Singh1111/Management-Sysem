// components/Items/ItemList.jsx
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const ItemList = ({ items, loading, error, budget, isAdmin, onEdit, onDelete, onTogglePurchase }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Get unique categories for filter
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    const filteredTotal = filteredItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const totalItemValue = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const budgetLeft = Number(budget || 0) - totalItemValue;

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedItem) {
            onDelete(selectedItem.id);
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
    };

    const handleTogglePurchase = (item) => {
        onTogglePurchase(item);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    label="Search Items"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}
                />
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        value={filterCategory}
                        label="Category"
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Stats */}
            <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Total Items</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>{filteredItems.length}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Total Value</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>₹{filteredTotal.toFixed(2)}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Purchased</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>{filteredItems.filter(item => item.purchased).length}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Budget Left</Typography>
                    <Typography variant="h6" color={budgetLeft < 0 ? 'error.main' : 'success.main'} sx={{ mt: 0.5 }}>
                        ₹{budgetLeft.toFixed(2)}
                    </Typography>
                </Paper>
            </Box>

            {/* Items Table */}
            <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                <Table sx={{ minWidth: 820 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Total Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                        No items found. Add your first item!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.name}
                                        </Typography>
                                        {item.description && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {item.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.category && (
                                            <Chip label={item.category} size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">₹{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                                    <TableCell align="center">{item.quantity}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                        ₹{parseFloat(item.total_price).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.purchased ? 'Purchased' : 'Pending'}
                                            color={item.purchased ? 'success' : 'error'}
                                            size="small"
                                            icon={item.purchased ? <CheckCircleIcon /> : <ShoppingCartIcon />}
                                        />
                                        {item.purchased && item.purchase_date && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {new Date(item.purchase_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {isAdmin && (
                                            <>
                                                <Tooltip title="Toggle Purchase Status">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleTogglePurchase(item)}
                                                        color={item.purchased ? 'success' : 'default'}
                                                    >
                                                        {item.purchased ? <CheckCircleIcon /> : <ShoppingCartIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => onEdit(item)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDeleteClick(item)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedItem?.name}"?
                    </Typography>
                    {selectedItem && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Total Value: ₹{parseFloat(selectedItem.total_price).toFixed(2)}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ItemList;