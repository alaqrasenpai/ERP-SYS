const mongoose = require('mongoose');

const attendanceAuditSchema = new mongoose.Schema({
    attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    oldClockIn: { type: Date },
    newClockIn: { type: Date },
    oldClockOut: { type: Date },
    newClockOut: { type: Date },
    reason: { type: String, required: true }
}, { timestamps: true });

module.exports = attendanceAuditSchema;
