const SemesterModel = require('../models/semester.model');

class SemesterController {
    static async getAllSemesters(req, res) {
        try {
            const semesters = await SemesterModel.getAllSemesters();
            res.json({ success: true, data: semesters });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getSemesterById(req, res) {
        try {
            const semester = await SemesterModel.getSemesterById(req.params.id);
            if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
            res.json({ success: true, data: semester });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createSemester(req, res) {
        try {
            const { semester_number, name } = req.body;
            if (!semester_number || !name) {
                return res.status(400).json({ success: false, message: 'Semester number and name are required' });
            }
            const semester = await SemesterModel.createSemester(req.body);
            res.status(201).json({ success: true, message: 'Semester created successfully', data: semester });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateSemester(req, res) {
        try {
            const existing = await SemesterModel.getSemesterById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Semester not found' });
            const semester = await SemesterModel.updateSemester(req.params.id, req.body);
            res.json({ success: true, message: 'Semester updated successfully', data: semester });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteSemester(req, res) {
        try {
            const existing = await SemesterModel.getSemesterById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Semester not found' });
            await SemesterModel.deleteSemester(req.params.id);
            res.json({ success: true, message: 'Semester deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = SemesterController;
