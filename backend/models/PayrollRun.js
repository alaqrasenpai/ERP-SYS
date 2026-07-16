const mongoose = require('mongoose');

const payrollRunSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
    basicSalary: { type: Number, required: true },
    totalAllowances: { type: Number, default: 0 },
    totalOvertimeHours: { type: Number, default: 0 },
    totalOvertimePay: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date }
}, { timestamps: true });

// Compound index to ensure one payroll run per employee per month
payrollRunSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = payrollRunSchema;
