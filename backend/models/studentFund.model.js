// backend/models/studentFund.model.js
const pool = require('../config/database');

class StudentFundModel {
    // Get all student funds with filters
    static async getAllStudentFunds(filters = {}) {
        let query = `
            SELECT 
                sf.*,
                COUNT(*) OVER() AS total_count,
                s.semester_number,
                s.name as semester_name,
                d.name as department_name,
                d.code as department_code,
                b.name as branch_name,
                b.code as branch_code,
                u.username as created_by_username
            FROM student_funds sf
            LEFT JOIN semesters s ON sf.semester_id = s.id
            LEFT JOIN departments d ON sf.department_id = d.id
            LEFT JOIN branches b ON sf.branch_id = b.id
            LEFT JOIN users u ON sf.created_by = u.id
            WHERE 1=1
        `;
        
        const values = [];
        let paramCount = 1;

        if (filters.semester_id) {
            query += ` AND sf.semester_id = $${paramCount}`;
            values.push(filters.semester_id);
            paramCount++;
        }

        if (filters.department_id) {
            query += ` AND sf.department_id = $${paramCount}`;
            values.push(filters.department_id);
            paramCount++;
        }

        if (filters.branch_id) {
            query += ` AND sf.branch_id = $${paramCount}`;
            values.push(filters.branch_id);
            paramCount++;
        }

        if (filters.payment_status) {
            query += ` AND sf.payment_status = $${paramCount}`;
            values.push(filters.payment_status);
            paramCount++;
        }

        if (filters.search) {
            query += ` AND (sf.student_name ILIKE $${paramCount} OR sf.student_id ILIKE $${paramCount} OR sf.email ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }

        query += ` ORDER BY sf.created_at DESC`;

        const hasPagination = filters.page !== undefined || filters.limit !== undefined;
        if (hasPagination) {
            const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
            const limit = Math.min(Math.max(Number.parseInt(filters.limit, 10) || 20, 1), 100);
            const offset = (page - 1) * limit;
            query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            values.push(limit, offset);
        }

        const result = await pool.query(query, values);
        return {
            rows: result.rows,
            count: result.rows[0]?.total_count || result.rows.length,
        };
    }

    // Get student fund by ID
    static async getStudentFundById(id) {
        const query = `
            SELECT 
                sf.*,
                s.semester_number,
                s.name as semester_name,
                d.name as department_name,
                d.code as department_code,
                b.name as branch_name,
                b.code as branch_code,
                u.username as created_by_username
            FROM student_funds sf
            LEFT JOIN semesters s ON sf.semester_id = s.id
            LEFT JOIN departments d ON sf.department_id = d.id
            LEFT JOIN branches b ON sf.branch_id = b.id
            LEFT JOIN users u ON sf.created_by = u.id
            WHERE sf.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get student fund by student ID
    static async getStudentFundByStudentId(studentId) {
        const query = `
            SELECT 
                sf.*,
                s.semester_number,
                s.name as semester_name,
                d.name as department_name,
                d.code as department_code,
                b.name as branch_name,
                b.code as branch_code
            FROM student_funds sf
            LEFT JOIN semesters s ON sf.semester_id = s.id
            LEFT JOIN departments d ON sf.department_id = d.id
            LEFT JOIN branches b ON sf.branch_id = b.id
            WHERE sf.student_id = $1
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows[0];
    }

    // Create student fund
    static async createStudentFund(fundData) {
        const {
            student_name,
            student_id,
            email,
            phone,
            semester_id,
            department_id,
            branch_id,
            fund_amount,
            paid_amount = 0,
            payment_status = 'pending',
            payment_date,
            payment_method,
            transaction_id,
            notes,
            created_by
        } = fundData;

        const query = `
            INSERT INTO student_funds (
                student_name,
                student_id,
                email,
                phone,
                semester_id,
                department_id,
                branch_id,
                fund_amount,
                paid_amount,
                payment_status,
                payment_date,
                payment_method,
                transaction_id,
                notes,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;

        const values = [
            student_name,
            student_id,
            email || null,
            phone || null,
            semester_id || null,
            department_id || null,
            branch_id || null,
            fund_amount,
            paid_amount,
            payment_status || 'pending',
            payment_date || null,
            payment_method || null,
            transaction_id || null,
            notes || null,
            created_by || null
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update student fund
    static async updateStudentFund(id, fundData) {
        const {
            student_name,
            student_id,
            email,
            phone,
            semester_id,
            department_id,
            branch_id,
            fund_amount,
            paid_amount,
            payment_status,
            payment_date,
            payment_method,
            transaction_id,
            notes
        } = fundData;

        const query = `
            UPDATE student_funds 
            SET 
                student_name = COALESCE($1, student_name),
                student_id = COALESCE($2, student_id),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                semester_id = COALESCE($5, semester_id),
                department_id = COALESCE($6, department_id),
                branch_id = COALESCE($7, branch_id),
                fund_amount = COALESCE($8, fund_amount),
                paid_amount = COALESCE($9, paid_amount),
                payment_status = COALESCE($10, payment_status),
                payment_date = COALESCE($11, payment_date),
                payment_method = COALESCE($12, payment_method),
                transaction_id = COALESCE($13, transaction_id),
                notes = COALESCE($14, notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $15
            RETURNING *
        `;

        const values = [
            student_name,
            student_id,
            email,
            phone,
            semester_id,
            department_id,
            branch_id,
            fund_amount,
            paid_amount,
            payment_status,
            payment_date,
            payment_method,
            transaction_id,
            notes,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update payment status
    static async updatePaymentStatus(id, paymentData) {
        const { paid_amount, payment_status, payment_date, payment_method, transaction_id } = paymentData;

        const query = `
            UPDATE student_funds 
            SET 
                paid_amount = $1,
                payment_status = $2,
                payment_date = $3,
                payment_method = $4,
                transaction_id = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `;

        const values = [
            paid_amount,
            payment_status,
            payment_date || new Date().toISOString().split('T')[0],
            payment_method || null,
            transaction_id || null,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete student fund
    static async deleteStudentFund(id) {
        const query = 'DELETE FROM student_funds WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get summary statistics
    static async getSummary(filters = {}) {
        let query = `
            SELECT 
                COUNT(*) as total_students,
                SUM(fund_amount) as total_fund_required,
                SUM(paid_amount) as total_fund_collected,
                SUM(fund_amount - paid_amount) as total_fund_pending,
                COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_students,
                COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_students,
                COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_students,
                AVG(paid_amount) as average_paid,
                AVG(fund_amount) as average_fund
            FROM student_funds
            WHERE 1=1
        `;
        
        const values = [];
        let paramCount = 1;

        if (filters.semester_id) {
            query += ` AND semester_id = $${paramCount}`;
            values.push(filters.semester_id);
            paramCount++;
        }

        if (filters.department_id) {
            query += ` AND department_id = $${paramCount}`;
            values.push(filters.department_id);
            paramCount++;
        }

        if (filters.branch_id) {
            query += ` AND branch_id = $${paramCount}`;
            values.push(filters.branch_id);
            paramCount++;
        }

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get summary by semester
    static async getSummaryBySemester() {
        const query = `
            SELECT 
                s.semester_number,
                s.name as semester_name,
                COUNT(sf.id) as total_students,
                SUM(sf.fund_amount) as total_fund_required,
                SUM(sf.paid_amount) as total_fund_collected,
                SUM(sf.fund_amount - sf.paid_amount) as total_fund_pending,
                COUNT(CASE WHEN sf.payment_status = 'paid' THEN 1 END) as paid_students,
                COUNT(CASE WHEN sf.payment_status = 'pending' THEN 1 END) as pending_students
            FROM student_funds sf
            LEFT JOIN semesters s ON sf.semester_id = s.id
            GROUP BY s.semester_number, s.name
            ORDER BY s.semester_number
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get summary by department
    static async getSummaryByDepartment() {
        const query = `
            SELECT 
                d.name as department_name,
                d.code as department_code,
                COUNT(sf.id) as total_students,
                SUM(sf.fund_amount) as total_fund_required,
                SUM(sf.paid_amount) as total_fund_collected,
                SUM(sf.fund_amount - sf.paid_amount) as total_fund_pending,
                ROUND((SUM(sf.paid_amount) / NULLIF(SUM(sf.fund_amount), 0) * 100), 2) as collection_percentage
            FROM student_funds sf
            LEFT JOIN departments d ON sf.department_id = d.id
            GROUP BY d.name, d.code
            ORDER BY d.name
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get summary by branch
    static async getSummaryByBranch(departmentId = null) {
        let query = `
            SELECT 
                b.name as branch_name,
                b.code as branch_code,
                d.name as department_name,
                COUNT(sf.id) as total_students,
                SUM(sf.fund_amount) as total_fund_required,
                SUM(sf.paid_amount) as total_fund_collected,
                SUM(sf.fund_amount - sf.paid_amount) as total_fund_pending,
                ROUND((SUM(sf.paid_amount) / NULLIF(SUM(sf.fund_amount), 0) * 100), 2) as collection_percentage
            FROM student_funds sf
            LEFT JOIN branches b ON sf.branch_id = b.id
            LEFT JOIN departments d ON sf.department_id = d.id
            WHERE 1=1
        `;
        
        const values = [];
        if (departmentId) {
            query += ` AND sf.department_id = $1`;
            values.push(departmentId);
        }
        
        query += ` GROUP BY b.name, b.code, d.name ORDER BY b.name`;
        
        const result = await pool.query(query, values);
        return result.rows;
    }

    // Get fund collections summary
    static async getFundCollections(filters = {}) {
        let query = `
            SELECT 
                fc.*,
                s.semester_number,
                s.name as semester_name,
                d.name as department_name,
                d.code as department_code,
                b.name as branch_name,
                b.code as branch_code
            FROM fund_collections fc
            LEFT JOIN semesters s ON fc.semester_id = s.id
            LEFT JOIN departments d ON fc.department_id = d.id
            LEFT JOIN branches b ON fc.branch_id = b.id
            WHERE 1=1
        `;
        
        const values = [];
        let paramCount = 1;

        if (filters.semester_id) {
            query += ` AND fc.semester_id = $${paramCount}`;
            values.push(filters.semester_id);
            paramCount++;
        }

        if (filters.department_id) {
            query += ` AND fc.department_id = $${paramCount}`;
            values.push(filters.department_id);
            paramCount++;
        }

        if (filters.branch_id) {
            query += ` AND fc.branch_id = $${paramCount}`;
            values.push(filters.branch_id);
            paramCount++;
        }

        query += ` ORDER BY fc.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = StudentFundModel;