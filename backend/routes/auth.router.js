// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);

// Super-admin user management
router.get('/users', authenticateToken, authorizeRoles('super_admin'), AuthController.getUsers);
router.patch('/users/:id/role', authenticateToken, authorizeRoles('super_admin'), AuthController.updateUserRole);

module.exports = router;