// backend/routes/branch.routes.js
const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branch.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', BranchController.getAllBranches);
router.get('/department/:departmentId', BranchController.getBranchesByDepartment);
router.get('/:id', BranchController.getBranchById);
router.post('/', BranchController.createBranch);
router.put('/:id', BranchController.updateBranch);
router.delete('/:id', BranchController.deleteBranch);

module.exports = router;