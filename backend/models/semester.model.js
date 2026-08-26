// backend/models/semester.model.js
const pool = require('../config/database');

class SemesterModel {
    static async getAllSemesters() {
        const query = `SELECT * FROM semesters WHERE is_active = true ORDER BY semester_number`;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getSemesterById(id) {
        const query = `SELECT * FROM semesters WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getSemesterByNumber(number) {
        const query = `SELECT * FROM semesters WHERE semester_number = $1`;
        const result = await pool.query(query, [number]);
        return result.rows[0];
    }

    static async createSemester(data) {
        const { semester_number, name, description } = data;
        const query = `
            INSERT INTO semesters (semester_number, name, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [semester_number, name, description]);
        return result.rows[0];
    }

    static async updateSemester(id, data) {
        const { semester_number, name, description, is_active } = data;
        const query = `
            UPDATE semesters 
            SET 
                semester_number = COALESCE($1, semester_number),
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                is_active = COALESCE($4, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const result = await pool.query(query, [semester_number, name, description, is_active, id]);
        return result.rows[0];
    }

    static async deleteSemester(id) {
        const query = `DELETE FROM semesters WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = SemesterModel;