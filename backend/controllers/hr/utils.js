const BiometricDevice = require('../../models/BiometricDevice');

const getModels = (req) => {
    return {
        Employee: req.tenantConnection.model('Employee'),
        Department: req.tenantConnection.model('Department'),
        Shift: req.tenantConnection.model('Shift'),
        Holiday: req.tenantConnection.model('Holiday'),
        Attendance: req.tenantConnection.model('Attendance'),
        AttendanceAudit: req.tenantConnection.model('AttendanceAudit'),
        LeaveRequest: req.tenantConnection.model('LeaveRequest'),
        PayrollRun: req.tenantConnection.model('PayrollRun')
    };
};

const DeviceLog = require('../../models/DeviceLog');

module.exports = { getModels, BiometricDevice, DeviceLog };
