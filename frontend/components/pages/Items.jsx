// pages/Items.jsx
import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Fab,
    Alert,
    Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import ItemForm from '../Items/ItemForm';
import ItemList from '../Items/ItemList';
import { getItems, createItem, updateItem, deleteItem } from '../../services/api';
import { getFinanceData, subscribeToFinanceData } from '../../services/financeStorage';
import { useAuth } from '../../context/AuthContext';

const Items = () => {
    const { user, isAdmin } = useAuth();
    const userId = user?.id;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [budget, setBudget] = useState(() => getFinanceData(userId).budget);

    useEffect(() => {
        return subscribeToFinanceData(() => setBudget(getFinanceData(userId).budget));
    }, [userId]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await getItems();
            setItems(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch items. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch items on component mount
    useEffect(() => {
        // The initial request synchronizes the list with the API.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchItems();
    }, []);

    const handleAddItem = async (formData) => {
        setLoading(true);
        try {
            const response = await createItem(formData);
            setItems(prev => [response.data.data, ...prev]);
            setShowForm(false);
            showSnackbar('Item added successfully!', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to add item. Please try again.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async (formData) => {
        setLoading(true);
        try {
            const response = await updateItem(editingItem.id, formData);
            setItems(prev => prev.map(item => 
                item.id === editingItem.id ? response.data.data : item
            ));
            setShowForm(false);
            setEditingItem(null);
            showSnackbar('Item updated successfully!', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to update item. Please try again.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        setLoading(true);
        try {
            await deleteItem(id);
            setItems(prev => prev.filter(item => item.id !== id));
            showSnackbar('Item deleted successfully!', 'success');
        } catch (err) {
            showSnackbar('Failed to delete item. Please try again.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePurchase = async (item) => {
        try {
            const response = await updateItem(item.id, {
                ...item,
                purchased: !item.purchased,
                purchase_date: !item.purchased ? new Date().toISOString().split('T')[0] : null
            });
            setItems(prev => prev.map(i => 
                i.id === item.id ? response.data.data : i
            ));
            showSnackbar(
                `Item marked as ${response.data.data.purchased ? 'purchased' : 'pending'}`,
                'success'
            );
        } catch (err) {
            showSnackbar('Failed to update item status.', 'error');
            console.error(err);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleExportPdf = () => {
        const document = new jsPDF();
        const finance = getFinanceData(userId);
        const totalSpend = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
        const budgetLeft = finance.budget - totalSpend;
        const pageHeight = document.internal.pageSize.getHeight();
        let y = 20;

        const addTableHeader = () => {
            document.setFillColor(25, 118, 210);
            document.setTextColor(255, 255, 255);
            document.rect(14, y - 6, 182, 8, 'F');
            document.text('Item', 17, y);
            document.text('Price', 92, y);
            document.text('Qty', 124, y);
            document.text('Total', 145, y);
            document.text('Status', 173, y);
            document.setTextColor(0, 0, 0);
            y += 9;
        };

        document.setFontSize(18);
        document.text('Party Items Report', 14, y);
        y += 8;
        document.setFontSize(10);
        document.setTextColor(90, 90, 90);
        document.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
        document.setTextColor(0, 0, 0);
        y += 12;
        addTableHeader();

        items.forEach((item) => {
            if (y > pageHeight - 22) {
                document.addPage();
                y = 18;
                addTableHeader();
            }
            const itemTotal = Number(item.total_price || 0);
            document.text(String(item.name || '').slice(0, 32), 17, y);
            document.text(`Rs. ${Number(item.unit_price || 0).toFixed(2)}`, 92, y);
            document.text(String(item.quantity || 0), 124, y);
            document.text(`Rs. ${itemTotal.toFixed(2)}`, 145, y);
            document.text(item.purchased ? 'Purchased' : 'Pending', 173, y);
            y += 7;
        });

        if (y > pageHeight - 38) {
            document.addPage();
            y = 20;
        }
        y += 5;
        document.line(14, y, 196, y);
        y += 9;
        document.setFontSize(11);
        document.text(`Total spend: Rs. ${totalSpend.toFixed(2)}`, 14, y);
        document.text(`Party budget: Rs. ${finance.budget.toFixed(2)}`, 14, y + 7);
        document.setFontSize(13);
        document.setTextColor(budgetLeft < 0 ? 190 : 25, budgetLeft < 0 ? 30 : 118, budgetLeft < 0 ? 30 : 70);
        document.text(`Budget left: Rs. ${budgetLeft.toFixed(2)}`, 14, y + 16);
        document.save('party-items-report.pdf');
        showSnackbar('PDF report downloaded.', 'success');
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 0, sm: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    Party Items Management
                </Typography>
                {!showForm && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                        <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf} sx={{ flex: { xs: 1, sm: 'initial' } }}>
                            Export PDF
                        </Button>
                        {isAdmin && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)} sx={{ flex: { xs: 1, sm: 'initial' } }}>
                                Add New Item
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {showForm ? (
                <ItemForm
                    initialData={editingItem}
                    onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                    onCancel={handleCancelForm}
                    isLoading={loading}
                />
            ) : (
                <ItemList
                    items={items}
                    loading={loading}
                    error={error}
                    budget={budget}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDeleteItem}
                    onTogglePurchase={handleTogglePurchase}
                />
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Floating Action Button for quick add */}
            {!showForm && isAdmin && (
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        display: { xs: 'flex', sm: 'none' }
                    }}
                    onClick={() => setShowForm(true)}
                >
                    <AddIcon />
                </Fab>
            )}
        </Container>
    );
};

export default Items;
