// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AuthModel = require('../models/auth.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

class AuthController {
    // Generate access token
    static generateAccessToken(user) {
        return jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );
    }

    // Generate refresh token
    static generateRefreshToken(user) {
        return jwt.sign(
            { userId: user.id, tokenId: crypto.randomUUID() },
            JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
    }

    // Register new user
    static async register(req, res) {
        try {
            const { username, email, password, full_name } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            }

            // Check if user exists
            const existingUser = await AuthModel.findUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            const existingUsername = await AuthModel.findUserByUsername(username);
            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already taken'
                });
            }

            // Create user
            const newUser = await AuthModel.createUser({
                username,
                email,
                password,
                full_name
            });

            // Generate tokens
            const accessToken = AuthController.generateAccessToken(newUser);
            const refreshToken = AuthController.generateRefreshToken(newUser);

            // Save refresh token
            const decoded = jwt.decode(refreshToken);
            await AuthModel.saveRefreshToken(
                newUser.id,
                refreshToken,
                new Date(decoded.exp * 1000)
            );

            // Remove sensitive data
            delete newUser.password_hash;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: newUser,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed. Please try again.'
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user
            const user = await AuthModel.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if account is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account has been deactivated'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Update last login
            await AuthModel.updateLastLogin(user.id);

            // Generate tokens
            const accessToken = AuthController.generateAccessToken(user);
            const refreshToken = AuthController.generateRefreshToken(user);

            // Save refresh token
            const decoded = jwt.decode(refreshToken);
            await AuthModel.saveRefreshToken(
                user.id,
                refreshToken,
                new Date(decoded.exp * 1000)
            );

            // Remove sensitive data
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                last_login: user.last_login
            };

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed. Please try again.'
            });
        }
    }

    // Refresh access token
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }

            // Verify refresh token
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            } catch (error) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Check if token exists in database
            const storedToken = await AuthModel.findRefreshToken(refreshToken);
            if (!storedToken) {
                return res.status(403).json({
                    success: false,
                    message: 'Refresh token not found or revoked'
                });
            }

            // Check if token is expired
            if (new Date(storedToken.expires_at) < new Date()) {
                await AuthModel.revokeRefreshToken(refreshToken);
                return res.status(403).json({
                    success: false,
                    message: 'Refresh token expired'
                });
            }

            // Get user
            const user = await AuthModel.findUserById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate new access token
            const newAccessToken = AuthController.generateAccessToken(user);

            res.json({
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).json({
                success: false,
                message: 'Token refresh failed'
            });
        }
    }

    // Logout
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await AuthModel.revokeRefreshToken(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = await AuthModel.findUserById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile'
            });
        }
    }

    // List users for super administrators
    static async getUsers(req, res) {
        try {
            const users = await AuthModel.findAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ success: false, message: 'Failed to get users' });
        }
    }

    // Promote members or demote administrators
    static async updateUserRole(req, res) {
        try {
            const userId = Number(req.params.id);
            const { role } = req.body;

            if (!Number.isInteger(userId) || !['member', 'admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'A valid user ID and role (member or admin) are required'
                });
            }

            if (userId === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot change your own role'
                });
            }

            const updatedUser = await AuthModel.updateRole(userId, role);
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({
                success: true,
                message: `User role updated to ${role}`,
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ success: false, message: 'Failed to update user role' });
        }
    }

    // Update profile
    static async updateProfile(req, res) {
        try {
            const { full_name, email } = req.body;
            
            // Check if email is already taken
            if (email) {
                const existingUser = await AuthModel.findUserByEmail(email);
                if (existingUser && existingUser.id !== req.user.id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already taken'
                    });
                }
            }

            const updatedUser = await AuthModel.updateProfile(req.user.id, {
                full_name,
                email
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            // Get user with password hash
            const user = await AuthModel.findUserById(req.user.id);
            
            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            await AuthModel.changePassword(req.user.id, newPassword);

            // Revoke all refresh tokens for security
            await AuthModel.revokeAllUserTokens(req.user.id);

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
}

module.exports = AuthController;