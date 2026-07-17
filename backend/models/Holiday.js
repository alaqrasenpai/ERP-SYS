const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    isRecurringYearly: { type: Boolean, default: false },
    notes: { type: String }
}, { timestamps: true });

module.exports = holidaySchema;
