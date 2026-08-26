// backend/controllers/department.controller.js
const DepartmentModel = require('../models/department.model');

class DepartmentController {
    static async getAllDepartments(req, res) {
        try {
            const departments = await DepartmentModel.getAllDepartments();
            res.json({
                success: true,
                data: departments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDepartmentById(req, res) {
        try {
            const department = await DepartmentModel.getDepartmentById(req.params.id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }
            res.json({
                success: true,
                data: department
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async createDepartment(req, res) {
        try {
            const { name, code, description } = req.body;
            
            if (!name || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and code are required'
                });
            }

            const department = await DepartmentModel.createDepartment({ name, code, description });
            res.status(201).json({
                success: true,
                message: 'Department created successfully',
                data: department
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updateDepartment(req, res) {
        try {
            const existing = await DepartmentModel.getDepartmentById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            const updated = await DepartmentModel.updateDepartment(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Department updated successfully',
                data: updated
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async deleteDepartment(req, res) {
        try {
            const existing = await DepartmentModel.getDepartmentById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            await DepartmentModel.deleteDepartment(req.params.id);
            res.json({
                success: true,
                message: 'Department deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = DepartmentController;