const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    manager: { type: String }
}, { timestamps: true });

module.exports = warehouseSchema;
