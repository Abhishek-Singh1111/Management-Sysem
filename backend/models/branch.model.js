// backend/models/branch.model.js
const pool = require('../config/database');

class BranchModel {
    static async getAllBranches(departmentId = null) {
        let query = `
            SELECT 
                b.*,
                d.name as department_name,
                d.code as department_code
            FROM branches b
            LEFT JOIN departments d ON b.department_id = d.id
            WHERE b.is_active = true
        `;
        const values = [];
        
        if (departmentId) {
            query += ` AND b.department_id = $1`;
            values.push(departmentId);
        }
        
        query += ` ORDER BY b.name`;
        
        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getBranchById(id) {
        const query = `
            SELECT 
                b.*,
                d.name as department_name,
                d.code as department_code
            FROM branches b
            LEFT JOIN departments d ON b.department_id = d.id
            WHERE b.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async createBranch(data) {
        const { department_id, name, code, description } = data;
        const query = `
            INSERT INTO branches (department_id, name, code, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [department_id, name, code, description]);
        return result.rows[0];
    }

    static async updateBranch(id, data) {
        const { department_id, name, code, description, is_active } = data;
        const query = `
            UPDATE branches 
            SET 
                department_id = COALESCE($1, department_id),
                name = COALESCE($2, name),
                code = COALESCE($3, code),
                description = COALESCE($4, description),
                is_active = COALESCE($5, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `;
        const result = await pool.query(query, [department_id, name, code, description, is_active, id]);
        return result.rows[0];
    }

    static async deleteBranch(id) {
        const query = `DELETE FROM branches WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get branches by department
    static async getBranchesByDepartment(departmentId) {
        const query = `
            SELECT * FROM branches 
            WHERE department_id = $1 AND is_active = true 
            ORDER BY name
        `;
        const result = await pool.query(query, [departmentId]);
        return result.rows;
    }
}

module.exports = BranchModel;