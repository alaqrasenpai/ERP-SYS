const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    defaultBalance: { type: Number, default: 0 }, // Optional default balance for when it's assigned to employees
    description: { type: String }
}, { timestamps: true });

module.exports = leaveTypeSchema;
