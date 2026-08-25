// models/item.model.js
const pool = require('../config/database');

class ItemModel {
    // Get all items
    static async getAllItems(filters = {}) {
        let query = `
            SELECT 
                id, 
                name, 
                description,
                unit_price,
                quantity,
                unit_price * quantity AS total_price,
                category,
                supplier,
                purchased,
                purchase_date,
                notes,
                created_by,
                created_at,
                updated_at
            FROM items 
            WHERE 1=1
        `;
        const values = [];
        let paramCount = 1;

        if (filters.category) {
            query += ` AND category = $${paramCount}`;
            values.push(filters.category);
            paramCount++;
        }

        if (filters.purchased !== undefined) {
            query += ` AND purchased = $${paramCount}`;
            values.push(filters.purchased);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC`;
        
        const result = await pool.query(query, values);
        return result.rows;
    }

    // Get single item by ID
    static async getItemById(id) {
        const query = `
            SELECT 
                id, 
                name, 
                description,
                unit_price,
                quantity,
                unit_price * quantity AS total_price,
                category,
                supplier,
                purchased,
                purchase_date,
                notes,
                created_by,
                created_at,
                updated_at
            FROM items 
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Create new item
    static async createItem(itemData) {
        const {
            name,
            description,
            unit_price,
            quantity,
            category,
            supplier,
            purchased = false,
            purchase_date,
            notes,
            created_by
        } = itemData;

        const query = `
            INSERT INTO items (
                name,
                description,
                unit_price,
                quantity,
                category,
                supplier,
                purchased,
                purchase_date,
                notes,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *, unit_price * quantity AS total_price
        `;

        const values = [
            name,
            description || null,
            unit_price,
            quantity || 1,
            category || null,
            supplier || null,
            purchased,
            purchase_date || null,
            notes || null,
            created_by || null
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update item
    static async updateItem(id, itemData) {
        const {
            name,
            description,
            unit_price,
            quantity,
            category,
            supplier,
            purchased,
            purchase_date,
            notes
        } = itemData;

        const query = `
            UPDATE items 
            SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                unit_price = COALESCE($3, unit_price),
                quantity = COALESCE($4, quantity),
                category = COALESCE($5, category),
                supplier = COALESCE($6, supplier),
                purchased = COALESCE($7, purchased),
                purchase_date = $8,
                notes = COALESCE($9, notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING *, unit_price * quantity AS total_price
        `;

        const values = [
            name,
            description,
            unit_price,
            quantity,
            category,
            supplier,
            purchased,
            purchase_date,
            notes,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete item
    static async deleteItem(id) {
        const query = 'DELETE FROM items WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get summary statistics
    static async getItemSummary() {
        const query = `
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                SUM(unit_price * quantity) as total_value,
                COUNT(CASE WHEN purchased = true THEN 1 END) as purchased_items,
                COUNT(CASE WHEN purchased = false THEN 1 END) as pending_items,
                AVG(unit_price) as average_price
            FROM items
        `;
        const result = await pool.query(query);
        return result.rows[0];
    }
}

module.exports = ItemModel;
