const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
    paidDate: { type: Date }
});

const installmentPlanSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    downPayment: { type: Number, default: 0 },
    installments: [installmentSchema]
}, { timestamps: true });

module.exports = installmentPlanSchema;
