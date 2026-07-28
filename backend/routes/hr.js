const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const readPerm = requirePermission('hr:read');
const managePerm = requirePermission('hr:manage');
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
router.get('', readPerm, dashboardController.getDashboardStats);

// ----------------------------------------
// Employee Routes
// ----------------------------------------
router.get('', readPerm, employeeController.getEmployees);
router.post('', managePerm, employeeController.createEmployee);
router.put('', managePerm, employeeController.updateEmployee);
router.delete('', managePerm, employeeController.deleteEmployee);
router.put('', managePerm, employeeController.updateLeaveBalances);

// ----------------------------------------
// Department Routes
// ----------------------------------------
router.get('', readPerm, departmentController.getDepartments);
router.post('', managePerm, departmentController.createDepartment);
router.put('', managePerm, departmentController.updateDepartment);
router.delete('', managePerm, departmentController.deleteDepartment);

// ----------------------------------------
// Shift Routes
// ----------------------------------------
router.get('', readPerm, shiftController.getShifts);
router.post('', managePerm, shiftController.createShift);
router.put('', managePerm, shiftController.updateShift);
router.delete('', managePerm, shiftController.deleteShift);

// ----------------------------------------
// Holiday Routes
// ----------------------------------------
router.get('', readPerm, holidayController.getHolidays);
router.post('', managePerm, holidayController.createHoliday);
router.put('', managePerm, holidayController.updateHoliday);
router.delete('', managePerm, holidayController.deleteHoliday);

// ----------------------------------------
// Attendance Routes
// ----------------------------------------
router.get('', readPerm, attendanceController.getReport);
router.get('', readPerm, attendanceController.getDailyGrid);
router.post('', managePerm, attendanceController.clockIn);
router.post('', managePerm, attendanceController.clockOut);
router.post('', managePerm, attendanceController.createManualAttendance);
router.put('', managePerm, attendanceController.overrideAttendance);
router.put('', managePerm, attendanceController.approveOvertime);
router.post('', managePerm, attendanceController.webPunch);
router.post('', managePerm, attendanceController.biometricPunch);

// ----------------------------------------
// Biometric Devices & Logs Routes
// ----------------------------------------
router.get('', readPerm, deviceController.getDevices);
router.post('', managePerm, deviceController.createDevice);
router.delete('', managePerm, deviceController.deleteDevice);
router.post('', managePerm, deviceController.fetchLogs);
router.get('', readPerm, deviceController.getPendingLogs);
router.post('', managePerm, deviceController.linkLog);

// ----------------------------------------
// Leave Requests Routes
// ----------------------------------------
router.get('', readPerm, leaveController.getLeaves);
router.post('', managePerm, leaveController.requestLeave);
router.put('', managePerm, leaveController.approveLeave);

// ----------------------------------------
// Payroll Routes
// ----------------------------------------
router.get('', readPerm, payrollController.getPayrollRuns);
router.post('', managePerm, payrollController.calculatePayroll);
router.put('', managePerm, payrollController.payPayroll);

// ----------------------------------------
// Allowances Routes
// ----------------------------------------
router.get('', readPerm, allowancesController.getAllowanceTypes);
router.post('', managePerm, allowancesController.createAllowanceType);
router.put('', managePerm, allowancesController.updateAllowanceType);
router.delete('', managePerm, allowancesController.deleteAllowanceType);

module.exports = router;
