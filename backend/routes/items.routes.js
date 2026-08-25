// routes/items.routes.js
const express = require('express');
const router = express.Router();
const ItemModel = require('../models/items.model');
const { authenticateToken } = require('../middleware/auth');

// Get all items with filters
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, purchased } = req.query;
        const filters = {};
        if (category) filters.category = category;
        if (purchased !== undefined) filters.purchased = purchased === 'true';
        
        const items = await ItemModel.getAllItems(filters);
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get item summary
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const summary = await ItemModel.getItemSummary();
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single item
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const item = await ItemModel.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new item
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, unit_price, quantity } = req.body;
        const price = Number(unit_price);
        const amount = Number(quantity);
        if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(amount) || amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'name, unit_price (>= 0), and quantity (whole number >= 1) are required'
            });
        }
        const itemData = {
            ...req.body,
            unit_price: price,
            quantity: amount,
            created_by: req.user.id
        };
        const newItem = await ItemModel.createItem(itemData);
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update item
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.body.unit_price !== undefined && (!Number.isFinite(Number(req.body.unit_price)) || Number(req.body.unit_price) < 0)) {
            return res.status(400).json({ success: false, message: 'unit_price must be a number >= 0' });
        }
        if (req.body.quantity !== undefined && (!Number.isInteger(Number(req.body.quantity)) || Number(req.body.quantity) < 1)) {
            return res.status(400).json({ success: false, message: 'quantity must be a whole number >= 1' });
        }
        const updatedItem = await ItemModel.updateItem(req.params.id, req.body);
        if (!updatedItem) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        res.json({ success: true, data: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete item
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedItem = await ItemModel.deleteItem(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;