const mongoose = require('mongoose');

const tableSectionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
}, { timestamps: true });

module.exports = tableSectionSchema;
