const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g., "08:00"
    endTime: { type: String, required: true }, // e.g., "17:00"
    workDays: [{ type: String, enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
    weekendDays: [{ type: String, enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
    gracePeriodMinutes: { type: Number, default: 15 },
    dailyHours: { type: Number, default: 8 }
}, { timestamps: true });

module.exports = shiftSchema;
