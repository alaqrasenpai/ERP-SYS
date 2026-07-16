const mongoose = require('mongoose');

const checkPaymentSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    checkNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Collected', 'Bounced'], default: 'Pending' }
}, { timestamps: true });

module.exports = checkPaymentSchema;
