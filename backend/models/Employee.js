const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    position: { type: String }, // Legacy/fallback
    jobTitleId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTitle' },
    basicSalary: { type: Number, required: true, default: 0 },
    allowance: { type: Number, default: 0 },
    overtimeRatePerHour: { type: Number, default: 0 },
    dailyWorkHours: { type: Number, default: 8 },
    joinedAt: { type: Date, default: Date.now },
    
    // Enterprise HRMS Fields
    nationalId: { type: String }, // should be unique per tenant
    passportNumber: { type: String },
    birthDate: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String },
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    employeeNumber: { type: String, sparse: true, unique: true }, // Mapped to Biometric/Time Clock ID
    biometricId: { type: String, sparse: true, unique: true }, // Mapped to ZKTeco PIN
    annualLeaveBalance: { type: Number, default: 21 },
    sickLeaveBalance: { type: Number, default: 14 },
    accumulatedLeaveHours: { type: Number, default: 0 },
    pendingSalaryDeductionDays: { type: Number, default: 0 },
    documents: [{
        title: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    activeLeaveBalances: [{
        leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
        name: { type: String }, // For convenience
        balance: { type: Number, default: 0 }
    }],
    delegatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    delegationEnd: { type: Date },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Bank Details
    bankDetails: {
        bankName: { type: String },
        iban: { type: String }
    },
    
    // Custom Allowances
    assignedAllowances: [{
        allowanceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AllowanceType' },
        name: { type: String },
        amount: { type: Number, required: true, default: 0 }
    }]
}, { timestamps: true });

// Ensure nationalId is unique if provided (sparse index to allow nulls and avoid conflicts on empty strings across tenants)
employeeSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

module.exports = employeeSchema;
