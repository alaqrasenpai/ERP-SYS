const express = require('express');
const router = express.Router();

const employeeController = require('../controllers/hr/employeeController');
const departmentController = require('../controllers/hr/departmentController');
const shiftController = require('../controllers/hr/shiftController');
const holidayController = require('../controllers/hr/holidayController');
const attendanceController = require('../controllers/hr/attendanceController');
const deviceController = require('../controllers/hr/deviceController');
const leaveController = require('../controllers/hr/leaveController');
const payrollController = require('../controllers/hr/payrollController');

// ----------------------------------------
// Employee Routes
// ----------------------------------------
router.get('/employees', employeeController.getEmployees);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.put('/employees/:id/leave-balances', employeeController.updateLeaveBalances);

// ----------------------------------------
// Department Routes
// ----------------------------------------
router.get('/departments', departmentController.getDepartments);
router.post('/departments', departmentController.createDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

// ----------------------------------------
// Shift Routes
// ----------------------------------------
router.get('/shifts', shiftController.getShifts);
router.post('/shifts', shiftController.createShift);
router.put('/shifts/:id', shiftController.updateShift);
router.delete('/shifts/:id', shiftController.deleteShift);

// ----------------------------------------
// Holiday Routes
// ----------------------------------------
router.get('/holidays', holidayController.getHolidays);
router.post('/holidays', holidayController.createHoliday);
router.put('/holidays/:id', holidayController.updateHoliday);
router.delete('/holidays/:id', holidayController.deleteHoliday);

// ----------------------------------------
// Attendance Routes
// ----------------------------------------
router.get('/attendance/report', attendanceController.getReport);
router.get('/attendance/daily-grid', attendanceController.getDailyGrid);
router.post('/attendance/clock-in', attendanceController.clockIn);
router.post('/attendance/clock-out', attendanceController.clockOut);
router.post('/attendance/manual', attendanceController.createManualAttendance);
router.put('/attendance/override/:id', attendanceController.overrideAttendance);
router.put('/attendance/overtime/approve/:id', attendanceController.approveOvertime);
router.post('/attendance/web-punch', attendanceController.webPunch);
router.post('/attendance/biometric-punch', attendanceController.biometricPunch);

// ----------------------------------------
// Biometric Devices & Logs Routes
// ----------------------------------------
router.get('/devices', deviceController.getDevices);
router.post('/devices', deviceController.createDevice);
router.delete('/devices/:id', deviceController.deleteDevice);
router.post('/devices/:id/fetch', deviceController.fetchLogs);
router.get('/devices/logs/pending', deviceController.getPendingLogs);
router.post('/devices/logs/:id/link', deviceController.linkLog);

// ----------------------------------------
// Leave Requests Routes
// ----------------------------------------
router.get('/leaves', leaveController.getLeaves);
router.post('/leaves/request', leaveController.requestLeave);
router.put('/leaves/:id/approve', leaveController.approveLeave);

// ----------------------------------------
// Payroll Routes
// ----------------------------------------
router.get('/payroll', payrollController.getPayrollRuns);
router.post('/payroll/calculate', payrollController.calculatePayroll);
router.put('/payroll/pay/:id', payrollController.payPayroll);

module.exports = router;
