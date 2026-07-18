const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema({
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = menuCategorySchema;
