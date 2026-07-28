const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const router = express.Router();

const employeeController = require('../controllers/hr/employeeController');
const departmentController = require('../controllers/hr/departmentController');
const shiftController = require('../controllers/hr/shiftController');
const holidayController = require('../controllers/hr/holidayController');
const attendanceController = require('../controllers/hr/attendanceController');
const deviceController = require('../controllers/hr/deviceController');
const leaveController = require('../controllers/hr/leaveController');
const payrollController = require('../controllers/hr/payrollController');
const dashboardController = require('../controllers/hr/dashboardController');
const allowancesController = require('../controllers/hr/allowancesController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', requirePermission('hr:dashboard:read'), dashboardController.getDashboardStats);

// ----------------------------------------
// Employee Routes
// ----------------------------------------
router.get('/employees', requirePermission('hr:employees:read'), employeeController.getEmployees);
router.post('/employees', requirePermission('hr:employees:manage'), employeeController.createEmployee);
router.put('/employees/:id', requirePermission('hr:employees:manage'), employeeController.updateEmployee);
router.delete('/employees/:id', requirePermission('hr:employees:manage'), employeeController.deleteEmployee);
router.put('/employees/:id/leave-balances', requirePermission('hr:employees:manage'), employeeController.updateLeaveBalances);

// ----------------------------------------
// Department Routes
// ----------------------------------------
router.get('/departments', requirePermission('hr:departments:read'), departmentController.getDepartments);
router.post('/departments', requirePermission('hr:departments:manage'), departmentController.createDepartment);
router.put('/departments/:id', requirePermission('hr:departments:manage'), departmentController.updateDepartment);
router.delete('/departments/:id', requirePermission('hr:departments:manage'), departmentController.deleteDepartment);

// ----------------------------------------
// Shift Routes
// ----------------------------------------
router.get('/shifts', requirePermission('hr:shifts:read'), shiftController.getShifts);
router.post('/shifts', requirePermission('hr:shifts:manage'), shiftController.createShift);
router.put('/shifts/:id', requirePermission('hr:shifts:manage'), shiftController.updateShift);
router.delete('/shifts/:id', requirePermission('hr:shifts:manage'), shiftController.deleteShift);

// ----------------------------------------
// Holiday Routes
// ----------------------------------------
router.get('/holidays', requirePermission('hr:shifts:read'), holidayController.getHolidays);
router.post('/holidays', requirePermission('hr:shifts:manage'), holidayController.createHoliday);
router.put('/holidays/:id', requirePermission('hr:shifts:manage'), holidayController.updateHoliday);
router.delete('/holidays/:id', requirePermission('hr:shifts:manage'), holidayController.deleteHoliday);

// ----------------------------------------
// Attendance Routes
// ----------------------------------------
router.get('/attendance/report', requirePermission('hr:attendance:read'), attendanceController.getReport);
router.get('/attendance/daily-grid', requirePermission('hr:attendance:read'), attendanceController.getDailyGrid);
router.post('/attendance/clock-in', requirePermission('hr:attendance:manage'), attendanceController.clockIn);
router.post('/attendance/clock-out', requirePermission('hr:attendance:manage'), attendanceController.clockOut);
router.post('/attendance/manual', requirePermission('hr:attendance:manage'), attendanceController.createManualAttendance);
router.put('/attendance/override/:id', requirePermission('hr:attendance:manage'), attendanceController.overrideAttendance);
router.put('/attendance/overtime/approve/:id', requirePermission('hr:attendance:manage'), attendanceController.approveOvertime);
router.post('/attendance/web-punch', requirePermission('hr:attendance:manage'), attendanceController.webPunch);
router.post('/attendance/biometric-punch', requirePermission('hr:attendance:manage'), attendanceController.biometricPunch);

// ----------------------------------------
// Biometric Devices & Logs Routes
// ----------------------------------------
router.get('/devices', requirePermission('hr:devices:read'), deviceController.getDevices);
router.post('/devices', requirePermission('hr:devices:manage'), deviceController.createDevice);
router.delete('/devices/:id', requirePermission('hr:devices:manage'), deviceController.deleteDevice);
router.post('/devices/:id/fetch', requirePermission('hr:devices:manage'), deviceController.fetchLogs);
router.get('/devices/logs/pending', requirePermission('hr:devices:read'), deviceController.getPendingLogs);
router.post('/devices/logs/:id/link', requirePermission('hr:devices:manage'), deviceController.linkLog);

// ----------------------------------------
// Leave Requests Routes
// ----------------------------------------
router.get('/leaves', requirePermission('hr:leaves:read'), leaveController.getLeaves);
router.post('/leaves/request', requirePermission('hr:leaves:manage'), leaveController.requestLeave);
router.put('/leaves/:id/approve', requirePermission('hr:leaves:manage'), leaveController.approveLeave);

// ----------------------------------------
// Payroll Routes
// ----------------------------------------
router.get('/payroll', requirePermission('hr:payroll:read'), payrollController.getPayrollRuns);
router.post('/payroll/calculate', requirePermission('hr:payroll:manage'), payrollController.calculatePayroll);
router.put('/payroll/pay/:id', requirePermission('hr:payroll:manage'), payrollController.payPayroll);

// ----------------------------------------
// Allowances Routes
// ----------------------------------------
router.get('/allowances', requirePermission('hr:allowances:read'), allowancesController.getAllowanceTypes);
router.post('/allowances', requirePermission('hr:allowances:manage'), allowancesController.createAllowanceType);
router.put('/allowances/:id', requirePermission('hr:allowances:manage'), allowancesController.updateAllowanceType);
router.delete('/allowances/:id', requirePermission('hr:allowances:manage'), allowancesController.deleteAllowanceType);

module.exports = router;
