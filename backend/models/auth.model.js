// models/auth.model.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

class AuthModel {
    // Find user by email
    static async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    // Find user by username
    static async findUserByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }

    // Find user by ID
    static async findUserById(id) {
        const query = `
            SELECT id, username, email, full_name, role, is_active, last_login, created_at 
            FROM users WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Find users without exposing password hashes
    static async findAllUsers() {
        const query = `
            SELECT id, username, email, full_name, role, is_active, last_login, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Update a user's application role
    static async updateRole(userId, role) {
        const query = `
            UPDATE users
            SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, username, email, full_name, role, is_active, last_login, created_at
        `;
        const result = await pool.query(query, [role, userId]);
        return result.rows[0];
    }

    // Create new user
    static async createUser(userData) {
        const { username, email, password, full_name, role = 'member' } = userData;
        
        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (username, email, password_hash, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, full_name, role, created_at
        `;

        const values = [username, email, password_hash, full_name, role];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update last login
    static async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        await pool.query(query, [userId]);
    }

    // Save refresh token
    static async saveRefreshToken(userId, token, expiresAt) {
        const query = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id, token, expires_at
        `;
        const values = [userId, token, expiresAt];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Find refresh token
    static async findRefreshToken(token) {
        const query = 'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = FALSE';
        const result = await pool.query(query, [token]);
        return result.rows[0];
    }

    // Revoke refresh token
    static async revokeRefreshToken(token) {
        const query = 'UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1 RETURNING id';
        const result = await pool.query(query, [token]);
        return result.rows[0];
    }

    // Revoke all refresh tokens for user
    static async revokeAllUserTokens(userId) {
        const query = 'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1';
        await pool.query(query, [userId]);
    }

    // Change password
    static async changePassword(userId, newPassword) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);
        
        const query = 'UPDATE users SET password_hash = $1 WHERE id = $2';
        await pool.query(query, [password_hash, userId]);
    }

    // Update user profile
    static async updateProfile(userId, userData) {
        const { full_name, email } = userData;
        const query = `
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, username, email, full_name, role
        `;
        const values = [full_name, email, userId];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = AuthModel;