// backend/controllers/studentFund.controller.js
const StudentFundModel = require('../models/studentFund.model');
const DepartmentModel = require('../models/department.model');
const BranchModel = require('../models/branch.model');
const SemesterModel = require('../models/semester.model');

class StudentFundController {
    // Get all student funds
    static async getAllStudentFunds(req, res) {
        try {
            const filters = req.query;
            const result = await StudentFundModel.getAllStudentFunds(filters);
            
            res.json({
                success: true,
                data: result.rows,
                count: Number(result.count)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get student fund by ID
    static async getStudentFundById(req, res) {
        try {
            const fund = await StudentFundModel.getStudentFundById(req.params.id);
            if (!fund) {
                return res.status(404).json({
                    success: false,
                    message: 'Student fund record not found'
                });
            }
            res.json({
                success: true,
                data: fund
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get student fund by student ID
    static async getStudentFundByStudentId(req, res) {
        try {
            const fund = await StudentFundModel.getStudentFundByStudentId(req.params.studentId);
            if (!fund) {
                return res.status(404).json({
                    success: false,
                    message: 'Student fund record not found'
                });
            }
            res.json({
                success: true,
                data: fund
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create student fund
    static async createStudentFund(req, res) {
        try {
            // Validate required fields
            const { student_name, student_id, fund_amount } = req.body;
            
            if (!student_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Student name is required'
                });
            }
            
            if (!student_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID is required'
                });
            }
            
            if (!fund_amount || fund_amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Fund amount must be greater than 0'
                });
            }

            // Check if student already exists
            const existing = await StudentFundModel.getStudentFundByStudentId(student_id);
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Student already has a fund record',
                    data: existing
                });
            }

            // Set default payment status based on paid amount
            const paid_amount = parseFloat(req.body.paid_amount) || 0;
            let payment_status = 'pending';
            if (paid_amount >= fund_amount) {
                payment_status = 'paid';
            } else if (paid_amount > 0) {
                payment_status = 'partial';
            }

            const fundData = {
                ...req.body,
                paid_amount,
                payment_status,
                created_by: req.user.id
            };

            const newFund = await StudentFundModel.createStudentFund(fundData);
            
            res.status(201).json({
                success: true,
                message: 'Student fund record created successfully',
                data: newFund
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update student fund
    static async updateStudentFund(req, res) {
        try {
            const existing = await StudentFundModel.getStudentFundById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Student fund record not found'
                });
            }

            const updatedFund = await StudentFundModel.updateStudentFund(req.params.id, req.body);
            
            res.json({
                success: true,
                message: 'Student fund record updated successfully',
                data: updatedFund
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update payment status
    static async updatePaymentStatus(req, res) {
        try {
            const existing = await StudentFundModel.getStudentFundById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Student fund record not found'
                });
            }

            const { paid_amount } = req.body;
            
            // Auto-calculate payment status
            let payment_status = 'pending';
            if (paid_amount >= existing.fund_amount) {
                payment_status = 'paid';
            } else if (paid_amount > 0) {
                payment_status = 'partial';
            }

            const paymentData = {
                ...req.body,
                payment_status,
                payment_date: req.body.payment_date || new Date().toISOString().split('T')[0]
            };

            const updated = await StudentFundModel.updatePaymentStatus(req.params.id, paymentData);
            
            res.json({
                success: true,
                message: 'Payment status updated successfully',
                data: updated
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete student fund
    static async deleteStudentFund(req, res) {
        try {
            const existing = await StudentFundModel.getStudentFundById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Student fund record not found'
                });
            }

            await StudentFundModel.deleteStudentFund(req.params.id);
            
            res.json({
                success: true,
                message: 'Student fund record deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get summary statistics
    static async getSummary(req, res) {
        try {
            const filters = req.query;
            const summary = await StudentFundModel.getSummary(filters);
            
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get summary by semester
    static async getSummaryBySemester(req, res) {
        try {
            const summary = await StudentFundModel.getSummaryBySemester();
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get summary by department
    static async getSummaryByDepartment(req, res) {
        try {
            const summary = await StudentFundModel.getSummaryByDepartment();
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get summary by branch
    static async getSummaryByBranch(req, res) {
        try {
            const { departmentId } = req.query;
            const summary = await StudentFundModel.getSummaryByBranch(departmentId);
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get fund collections
    static async getFundCollections(req, res) {
        try {
            const filters = req.query;
            const collections = await StudentFundModel.getFundCollections(filters);
            res.json({
                success: true,
                data: collections
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Bulk import students
    static async bulkImportStudents(req, res) {
        try {
            const { students } = req.body;
            
            if (!students || !Array.isArray(students) || students.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Students array is required'
                });
            }

            const results = {
                success: [],
                failed: []
            };

            for (const student of students) {
                try {
                    const existing = await StudentFundModel.getStudentFundByStudentId(student.student_id);
                    if (existing) {
                        results.failed.push({
                            ...student,
                            reason: 'Student already exists'
                        });
                        continue;
                    }

                    const newFund = await StudentFundModel.createStudentFund({
                        ...student,
                        created_by: req.user.id
                    });
                    
                    results.success.push(newFund);
                } catch (error) {
                    results.failed.push({
                        ...student,
                        reason: error.message
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: `Imported ${results.success.length} students, ${results.failed.length} failed`,
                data: results
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Export data
    static async exportData(req, res) {
        try {
            const filters = req.query;
            const result = await StudentFundModel.getAllStudentFunds({ ...filters, page: undefined, limit: undefined });
            const data = result.rows;
            
            res.json({
                success: true,
                data: data,
                count: data.length,
                exported_at: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = StudentFundController;