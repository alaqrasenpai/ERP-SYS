const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    balanceDue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = supplierSchema;
