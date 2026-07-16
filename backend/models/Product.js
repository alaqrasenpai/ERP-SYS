const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    unitPrice: { type: Number, required: true, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    alertQuantity: { type: Number, default: 10 },
    barcode: { type: String, unique: true, sparse: true },
    uom: { type: String, default: 'Piece' },
    hasExpiry: { type: Boolean, default: false },
    isForSale: { type: Boolean, default: true },
    expiryDate: { type: Date },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
}, { timestamps: true });

module.exports = productSchema;
