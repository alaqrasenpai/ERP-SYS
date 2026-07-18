const mongoose = require('mongoose');

const deliveryProviderSchema = new mongoose.Schema({
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    commissionRate: { type: Number, required: true, default: 0 },
    contactPhone: { type: String },
    accountBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = deliveryProviderSchema;
