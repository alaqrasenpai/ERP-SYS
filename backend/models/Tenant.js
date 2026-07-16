const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tenantId: { type: String, required: true, unique: true },
    dbName: { type: String, required: true, unique: true },
    enabledModules: [{
        type: String,
        enum: ['inventory', 'archive', 'attendance', 'payroll', 'pos']
    }],
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
