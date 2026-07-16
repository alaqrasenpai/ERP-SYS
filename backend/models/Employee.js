const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    position: { type: String, required: true },
    basicSalary: { type: Number, required: true, default: 0 },
    allowance: { type: Number, default: 0 },
    overtimeRatePerHour: { type: Number, default: 0 },
    dailyWorkHours: { type: Number, default: 8 },
    joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = employeeSchema;
