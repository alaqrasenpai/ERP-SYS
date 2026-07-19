const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'BiometricDevice' },
    tenantId: { type: String, required: true },
    deviceEmployeeNumber: { type: String, required: true },
    recordTime: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Processed', 'Ignored'], default: 'Pending' },
    linkedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    verificationMethod: { type: Number, default: 1 } // 1 for Fingerprint, etc. depending on device
}, { timestamps: true });

// Prevent duplicate logs from the same device for the same punch
deviceLogSchema.index({ deviceId: 1, deviceEmployeeNumber: 1, recordTime: 1 }, { unique: true });

module.exports = mongoose.model('DeviceLog', deviceLogSchema);
