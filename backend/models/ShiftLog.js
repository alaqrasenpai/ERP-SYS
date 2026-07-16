const mongoose = require('mongoose');

const shiftLogSchema = new mongoose.Schema({
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    openingBalance: { type: Number, required: true },
    closingBalance: { type: Number },
    expectedBalance: { type: Number },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
}, { timestamps: true });

module.exports = shiftLogSchema;
