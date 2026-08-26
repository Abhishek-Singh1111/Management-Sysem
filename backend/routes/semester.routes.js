const express = require('express');
const SemesterController = require('../controllers/semester.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', SemesterController.getAllSemesters);
router.get('/:id', SemesterController.getSemesterById);
router.post('/', SemesterController.createSemester);
router.put('/:id', SemesterController.updateSemester);
router.delete('/:id', SemesterController.deleteSemester);

module.exports = router;
