const mongoose = require('mongoose');

const biometricDeviceSchema = new mongoose.Schema({
    deviceName: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    warehouseOrBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    tenantId: { type: String, required: true },
    ipAddress: { type: String },
    status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
    lastPing: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('BiometricDevice', biometricDeviceSchema);
