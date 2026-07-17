const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    clockIn: { type: Date },
    clockOut: { type: Date },
    totalHours: { type: Number, default: 0 },
    status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Late'], default: 'Present' },
    
    // Biometric & Tracking fields
    punchInType: { type: String, enum: ['Fingerprint', 'Face', 'Card', 'Web', 'Manual-HR'], default: 'Web' },
    punchOutType: { type: String, enum: ['Fingerprint', 'Face', 'Card', 'Web', 'Manual-HR'] },
    deviceId: { type: String }, // e.g., ZKTeco Terminal ID or IP
    
    // Overtime & Anomalies
    overtimeHours: { type: Number, default: 0 },
    overtimeStatus: { type: String, enum: ['None', 'Pending Approval', 'Approved', 'Rejected'], default: 'None' },
    isAnomalous: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = attendanceSchema;
