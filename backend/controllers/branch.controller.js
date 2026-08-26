const BranchModel = require('../models/branch.model');

class BranchController {
    static async getAllBranches(req, res) {
        try {
            const branches = await BranchModel.getAllBranches(req.query.department_id || null);
            res.json({ success: true, data: branches });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getBranchesByDepartment(req, res) {
        try {
            const branches = await BranchModel.getBranchesByDepartment(req.params.departmentId);
            res.json({ success: true, data: branches });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getBranchById(req, res) {
        try {
            const branch = await BranchModel.getBranchById(req.params.id);
            if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
            res.json({ success: true, data: branch });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createBranch(req, res) {
        try {
            const { department_id, name, code } = req.body;
            if (!department_id || !name || !code) {
                return res.status(400).json({ success: false, message: 'Department, name, and code are required' });
            }
            const branch = await BranchModel.createBranch(req.body);
            res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateBranch(req, res) {
        try {
            const existing = await BranchModel.getBranchById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Branch not found' });
            const branch = await BranchModel.updateBranch(req.params.id, req.body);
            res.json({ success: true, message: 'Branch updated successfully', data: branch });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteBranch(req, res) {
        try {
            const existing = await BranchModel.getBranchById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Branch not found' });
            await BranchModel.deleteBranch(req.params.id);
            res.json({ success: true, message: 'Branch deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = BranchController;
