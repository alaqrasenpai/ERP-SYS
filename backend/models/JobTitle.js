const mongoose = require('mongoose');

const jobTitleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameEn: { type: String }, // Optional english name
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = jobTitleSchema;
