const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    parentDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    description: { type: String }
}, { timestamps: true });

module.exports = departmentSchema;
