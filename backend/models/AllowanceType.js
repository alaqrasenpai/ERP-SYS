const mongoose = require('mongoose');

const allowanceTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = allowanceTypeSchema;
