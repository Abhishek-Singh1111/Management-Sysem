const express = require('express');
const DepartmentController = require('../controllers/department.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', DepartmentController.getAllDepartments);
router.get('/:id', DepartmentController.getDepartmentById);
router.post('/', DepartmentController.createDepartment);
router.put('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);

module.exports = router;
