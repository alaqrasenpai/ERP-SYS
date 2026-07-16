const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }]
}, { timestamps: true });

// Export the schema directly; the tenant connection manager will compile the model.
module.exports = roleSchema;
