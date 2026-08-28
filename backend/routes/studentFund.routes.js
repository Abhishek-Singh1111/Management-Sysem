// backend/routes/studentFund.routes.js
const express = require('express');
const router = express.Router();
const StudentFundController = require('../controllers/studentFund.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Summary routes (must be before /:id routes)
router.get('/summary', StudentFundController.getSummary);
router.get('/summary/semester', StudentFundController.getSummaryBySemester);
router.get('/summary/department', StudentFundController.getSummaryByDepartment);
router.get('/summary/branch', StudentFundController.getSummaryByBranch);
router.get('/collections', StudentFundController.getFundCollections);
router.get('/export/data', StudentFundController.exportData);

// CRUD routes
router.get('/', StudentFundController.getAllStudentFunds);
router.get('/student/:studentId', StudentFundController.getStudentFundByStudentId);
router.get('/:id', StudentFundController.getStudentFundById);

router.post('/', authorizeRoles('admin', 'super_admin'), StudentFundController.createStudentFund);
router.post('/bulk-import', authorizeRoles('admin', 'super_admin'), StudentFundController.bulkImportStudents);

router.put('/:id', authorizeRoles('admin', 'super_admin'), StudentFundController.updateStudentFund);
router.put('/:id/payment', authorizeRoles('admin', 'super_admin'), StudentFundController.updatePaymentStatus);

router.delete('/:id', authorizeRoles('admin', 'super_admin'), StudentFundController.deleteStudentFund);

module.exports = router;