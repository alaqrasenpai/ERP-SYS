const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'], required: true },
    balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = accountSchema;
