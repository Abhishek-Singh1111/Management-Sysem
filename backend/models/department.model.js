// backend/models/department.model.js
const pool = require('../config/database');

class DepartmentModel {
    static async getAllDepartments() {
        const query = `SELECT * FROM departments WHERE is_active = true ORDER BY name`;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getDepartmentById(id) {
        const query = `SELECT * FROM departments WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async createDepartment(data) {
        const { name, code, description } = data;
        const query = `
            INSERT INTO departments (name, code, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [name, code, description]);
        return result.rows[0];
    }

    static async updateDepartment(id, data) {
        const { name, code, description, is_active } = data;
        const query = `
            UPDATE departments 
            SET 
                name = COALESCE($1, name),
                code = COALESCE($2, code),
                description = COALESCE($3, description),
                is_active = COALESCE($4, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const result = await pool.query(query, [name, code, description, is_active, id]);
        return result.rows[0];
    }

    static async deleteDepartment(id) {
        const query = `DELETE FROM departments WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = DepartmentModel;