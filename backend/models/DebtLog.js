const mongoose = require('mongoose');

const debtLogSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Optional, manual debt might not have an order
    type: { type: String, enum: ['charge', 'payment'], required: true }, // charge increases debt, payment decreases it
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Check', 'Transfer', 'Debt', 'Installment'], default: 'Debt' },
    notes: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = debtLogSchema;
