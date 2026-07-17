const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['Annual', 'Sick', 'Unpaid', 'Hourly Departure'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String }, // For hourly departures
    endTime: { type: String },   // For hourly departures
    totalDays: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reason: { type: String, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerNotes: { type: String }
}, { timestamps: true });

module.exports = leaveRequestSchema;
