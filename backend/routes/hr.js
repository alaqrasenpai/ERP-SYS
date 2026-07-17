const express = require('express');
const router = express.Router();
const BiometricDevice = require('../models/BiometricDevice');

// ----------------------------------------
// Employee Routes
// ----------------------------------------
router.get('/employees', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const employees = await Employee.find().populate('departmentId').populate('shiftId').sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
});

router.post('/employees', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const newEmployee = await Employee.create(req.body);
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating employee', error: error.message });
    }
});

router.put('/employees/:id', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error updating employee', error: error.message });
    }
});

router.delete('/employees/:id', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting employee', error: error.message });
    }
});

// ----------------------------------------
// Department Routes
// ----------------------------------------
router.get('/departments', async (req, res) => {
    try {
        const Department = req.tenantConnection.model('Department');
        const depts = await Department.find().populate('parentDepartmentId').populate('managerId').sort({ createdAt: -1 });
        res.json(depts);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/departments', async (req, res) => {
    try {
        const Department = req.tenantConnection.model('Department');
        const dept = await Department.create(req.body);
        res.status(201).json(dept);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/departments/:id', async (req, res) => {
    try {
        const Department = req.tenantConnection.model('Department');
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(dept);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/departments/:id', async (req, res) => {
    try {
        const Department = req.tenantConnection.model('Department');
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// ----------------------------------------
// Shift Routes
// ----------------------------------------
router.get('/shifts', async (req, res) => {
    try {
        const Shift = req.tenantConnection.model('Shift');
        const shifts = await Shift.find().sort({ createdAt: -1 });
        res.json(shifts);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/shifts', async (req, res) => {
    try {
        const Shift = req.tenantConnection.model('Shift');
        const shift = await Shift.create(req.body);
        res.status(201).json(shift);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/shifts/:id', async (req, res) => {
    try {
        const Shift = req.tenantConnection.model('Shift');
        const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(shift);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/shifts/:id', async (req, res) => {
    try {
        const Shift = req.tenantConnection.model('Shift');
        await Shift.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// ----------------------------------------
// Holiday Routes
// ----------------------------------------
router.get('/holidays', async (req, res) => {
    try {
        const Holiday = req.tenantConnection.model('Holiday');
        const holidays = await Holiday.find().sort({ fromDate: -1 });
        res.json(holidays);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/holidays', async (req, res) => {
    try {
        const Holiday = req.tenantConnection.model('Holiday');
        const holiday = await Holiday.create(req.body);
        res.status(201).json(holiday);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/holidays/:id', async (req, res) => {
    try {
        const Holiday = req.tenantConnection.model('Holiday');
        const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(holiday);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/holidays/:id', async (req, res) => {
    try {
        const Holiday = req.tenantConnection.model('Holiday');
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// ----------------------------------------
// Attendance Routes
// ----------------------------------------
router.get('/attendance/report', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        // month query param expected as YYYY-MM
        const { month } = req.query; 
        let filter = {};
        if (month) {
            filter.date = { $regex: `^${month}` };
        }
        
        const logs = await Attendance.find(filter).populate('employeeId').sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

router.post('/attendance/clock-in', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const { employeeId } = req.body;
        
        // Format date to YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        let attendance = await Attendance.findOne({ employeeId, date: today });
        if (attendance) {
            if (attendance.clockIn) return res.status(400).json({ message: 'Already clocked in today' });
            attendance.clockIn = new Date();
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                employeeId,
                date: today,
                clockIn: new Date(),
                status: 'Present' // logic for Late can be added here
            });
        }
        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error clocking in', error: error.message });
    }
});

router.post('/attendance/clock-out', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const { employeeId } = req.body;
        
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ employeeId, date: today });
        
        if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });
        if (attendance.clockOut) return res.status(400).json({ message: 'Already clocked out today' });
        
        attendance.clockOut = new Date();
        
        // Calculate total hours
        const diffMs = attendance.clockOut - attendance.clockIn;
        const diffHrs = diffMs / (1000 * 60 * 60);
        attendance.totalHours = Number(diffHrs.toFixed(2));
        
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error clocking out', error: error.message });
    }
});

router.get('/attendance/daily-grid', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const Employee = req.tenantConnection.model('Employee');
        const { date } = req.query; // YYYY-MM-DD
        const filterDate = date || new Date().toISOString().split('T')[0];

        // Fetch all employees and their today's attendance
        const employees = await Employee.find().populate('departmentId').populate('shiftId');
        const attendances = await Attendance.find({ date: filterDate }).lean();
        
        const grid = employees.map(emp => {
            const att = attendances.find(a => a.employeeId.toString() === emp._id.toString());
            let status = att ? att.status : 'Absent';
            let isAnomalous = att ? att.isAnomalous : false;

            // If no punch out and shift ended, mark anomalous
            if (att && att.clockIn && !att.clockOut && emp.shiftId) {
                const shiftEndParts = (emp.shiftId.endTime || "17:00").split(':').map(Number);
                const shiftEnd = new Date(filterDate);
                shiftEnd.setHours(shiftEndParts[0], shiftEndParts[1], 0, 0);
                if (new Date() > shiftEnd) {
                    isAnomalous = true;
                }
            }

            return {
                employee: { _id: emp._id, firstName: emp.firstName, lastName: emp.lastName, code: emp.code },
                department: emp.departmentId ? emp.departmentId.name : 'N/A',
                shift: emp.shiftId ? emp.shiftId.name : 'N/A',
                attendanceId: att ? att._id : null,
                clockIn: att ? att.clockIn : null,
                clockOut: att ? att.clockOut : null,
                punchInType: att ? att.punchInType : null,
                punchOutType: att ? att.punchOutType : null,
                status,
                totalHours: att ? att.totalHours : 0,
                overtimeHours: att ? att.overtimeHours : 0,
                overtimeStatus: att ? att.overtimeStatus : 'None',
                isAnomalous
            };
        });

        res.json(grid);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching daily grid', error: error.message });
    }
});

router.put('/attendance/override/:id', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const AttendanceAudit = req.tenantConnection.model('AttendanceAudit');
        
        const { newClockIn, newClockOut, reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required for manual override' });

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

        // Save Audit
        await AttendanceAudit.create({
            attendanceId: attendance._id,
            employeeId: attendance.employeeId,
            modifiedBy: req.user._id,
            oldClockIn: attendance.clockIn,
            newClockIn,
            oldClockOut: attendance.clockOut,
            newClockOut,
            reason
        });

        // Update Record
        attendance.clockIn = newClockIn || attendance.clockIn;
        attendance.clockOut = newClockOut || attendance.clockOut;
        if (newClockIn) attendance.punchInType = 'Manual-HR';
        if (newClockOut) attendance.punchOutType = 'Manual-HR';
        attendance.isAnomalous = false;

        if (attendance.clockIn && attendance.clockOut) {
            const diffMs = new Date(attendance.clockOut) - new Date(attendance.clockIn);
            attendance.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        await attendance.save();
        res.json({ message: 'Attendance overridden successfully', attendance });
    } catch (error) {
        res.status(400).json({ message: 'Error overriding attendance', error: error.message });
    }
});

router.put('/attendance/overtime/approve/:id', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const { status } = req.body; // 'Approved' or 'Rejected'
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const attendance = await Attendance.findByIdAndUpdate(req.params.id, { overtimeStatus: status }, { new: true });
        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error updating overtime', error: error.message });
    }
});

router.post('/attendance/web-punch', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const Employee = req.tenantConnection.model('Employee');
        const { type } = req.body; // 'in' or 'out'
        
        // Find employee by user ref (Assuming req.user is linked to Employee)
        // If not, we fall back to requiring employeeId. For self-service, usually req.user is an employee.
        // But since users and employees are separate, we assume frontend passes employeeId for now.
        const { employeeId } = req.body; 
        if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

        const employee = await Employee.findById(employeeId).populate('shiftId');
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const punchTime = new Date();
        const todayStr = punchTime.toISOString().split('T')[0];
        
        let attendance = await Attendance.findOne({ employeeId: employee._id, date: todayStr });
        
        if (type === 'in') {
            if (attendance && attendance.clockIn) return res.status(400).json({ message: 'Already clocked in today' });
            
            if (!attendance) {
                attendance = new Attendance({
                    employeeId: employee._id,
                    date: todayStr,
                    punchInType: 'Web',
                    status: 'Present'
                });
            }
            attendance.clockIn = punchTime;
            attendance.punchInType = 'Web';
            await attendance.save();

        } else if (type === 'out') {
            if (!attendance || !attendance.clockIn) return res.status(400).json({ message: 'Must clock in first' });
            if (attendance.clockOut) return res.status(400).json({ message: 'Already clocked out' });

            attendance.clockOut = punchTime;
            attendance.punchOutType = 'Web';
            
            const diffMs = attendance.clockOut - attendance.clockIn;
            attendance.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
            
            // Basic Overtime Calculation
            if (employee.shiftId && employee.shiftId.dailyHours) {
                if (attendance.totalHours > employee.shiftId.dailyHours) {
                    attendance.overtimeHours = Number((attendance.totalHours - employee.shiftId.dailyHours).toFixed(2));
                    attendance.overtimeStatus = 'Pending Approval';
                }
            }

            await attendance.save();
        }
        
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ----------------------------------------
// Biometric Devices Routes
// ----------------------------------------
router.get('/devices', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const devices = await BiometricDevice.find({ tenantId });
        res.json(devices);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/devices', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const deviceData = { ...req.body, tenantId };
        const device = await BiometricDevice.create(deviceData);
        res.status(201).json(device);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/devices/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        await BiometricDevice.findOneAndDelete({ _id: req.params.id, tenantId });
        res.json({ message: 'Device deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// ----------------------------------------
// Leave Requests Routes
// ----------------------------------------
router.get('/leaves', async (req, res) => {
    try {
        const LeaveRequest = req.tenantConnection.model('LeaveRequest');
        const leaves = await LeaveRequest.find().populate('employeeId').populate('approvedBy').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/leaves/request', async (req, res) => {
    try {
        const LeaveRequest = req.tenantConnection.model('LeaveRequest');
        const Employee = req.tenantConnection.model('Employee');
        const Holiday = req.tenantConnection.model('Holiday');

        const { employeeId, type, startDate, endDate, startTime, endTime, reason } = req.body;
        
        const employee = await Employee.findById(employeeId).populate('shiftId');
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        let totalDays = 0;
        let totalHours = 0;

        if (type === 'Hourly Departure') {
            const [sH, sM] = (startTime || "00:00").split(':').map(Number);
            const [eH, eM] = (endTime || "00:00").split(':').map(Number);
            totalHours = (eH + eM/60) - (sH + sM/60);
            if(totalHours < 0) totalHours = 0;
        } else {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            const holidays = await Holiday.find({
                $or: [
                    { fromDate: { $lte: end }, toDate: { $gte: start } },
                    { isRecurringYearly: true }
                ]
            });
            
            let current = new Date(start);
            while (current <= end) {
                const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
                const isWeekend = employee.shiftId && employee.shiftId.weekendDays.includes(dayName);
                
                let isHoliday = false;
                for (const h of holidays) {
                    if (h.isRecurringYearly) {
                        if (h.fromDate.getMonth() === current.getMonth() && h.fromDate.getDate() === current.getDate()) {
                            isHoliday = true; break;
                        }
                    } else {
                        if (current >= h.fromDate && current <= h.toDate) {
                            isHoliday = true; break;
                        }
                    }
                }
                
                if (!isWeekend && !isHoliday) {
                    totalDays++;
                }
                current.setDate(current.getDate() + 1);
            }
        }

        if (type === 'Annual' && totalDays > employee.annualLeaveBalance) {
            return res.status(400).json({ message: `Insufficient annual leave balance. Requested: ${totalDays}, Balance: ${employee.annualLeaveBalance}` });
        }
        if (type === 'Sick' && totalDays > employee.sickLeaveBalance) {
            return res.status(400).json({ message: `Insufficient sick leave balance. Requested: ${totalDays}, Balance: ${employee.sickLeaveBalance}` });
        }

        const leave = await LeaveRequest.create({
            employeeId, type, startDate, endDate, startTime, endTime, totalDays, totalHours, reason, status: 'Pending'
        });

        res.status(201).json(leave);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/leaves/:id/approve', async (req, res) => {
    try {
        const LeaveRequest = req.tenantConnection.model('LeaveRequest');
        const Employee = req.tenantConnection.model('Employee');
        
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });
        if (leave.status === 'Approved') return res.status(400).json({ message: 'Already approved' });
        
        const employee = await Employee.findById(leave.employeeId);
        
        if (req.body.status === 'Approved') {
            if (leave.type === 'Annual') {
                employee.annualLeaveBalance -= leave.totalDays;
            } else if (leave.type === 'Sick') {
                employee.sickLeaveBalance -= leave.totalDays;
            }
            await employee.save();
        }
        
        leave.status = req.body.status;
        leave.managerNotes = req.body.managerNotes;
        leave.approvedBy = req.user ? req.user._id : null;
        await leave.save();
        
        res.json(leave);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.post('/attendance/biometric-punch', async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const Employee = req.tenantConnection.model('Employee');
        
        const { nationalId, timestamp, deviceId, verificationMethod } = req.body;
        
        const employee = await Employee.findOne({ nationalId }).populate('shiftId');
        if (!employee) return res.status(404).json({ message: `Employee with National ID ${nationalId} not found` });
        
        const punchTime = new Date(timestamp);
        const todayStr = punchTime.toISOString().split('T')[0];
        
        let attendance = await Attendance.findOne({ employeeId: employee._id, date: todayStr });
        
        if (!attendance) {
            let status = 'Present';
            
            if (employee.shiftId && employee.shiftId.startTime) {
                const [h, m] = employee.shiftId.startTime.split(':').map(Number);
                const expectedStart = new Date(punchTime);
                expectedStart.setHours(h, m, 0, 0);
                
                const diffMins = (punchTime - expectedStart) / (1000 * 60);
                if (diffMins > (employee.shiftId.gracePeriodMinutes || 15)) {
                    status = 'Late';
                }
            }
            
            attendance = await Attendance.create({
                employeeId: employee._id,
                date: todayStr,
                clockIn: punchTime,
                status,
                punchType: 'Biometric/Fingerprint',
                deviceId,
                verificationMethod: verificationMethod || 'Fingerprint'
            });
        } else {
            attendance.clockOut = punchTime;
            const diffMs = attendance.clockOut - attendance.clockIn;
            const diffHrs = diffMs / (1000 * 60 * 60);
            attendance.totalHours = Number(diffHrs.toFixed(2));
            await attendance.save();
        }
        
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ----------------------------------------
// Payroll Routes
// ----------------------------------------
router.get('/payroll', async (req, res) => {
    try {
        const PayrollRun = req.tenantConnection.model('PayrollRun');
        const runs = await PayrollRun.find().populate('employeeId').sort({ month: -1 });
        res.json(runs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payroll runs', error: error.message });
    }
});

router.post('/payroll/calculate', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const Attendance = req.tenantConnection.model('Attendance');
        const PayrollRun = req.tenantConnection.model('PayrollRun');
        
        const { month } = req.body; // YYYY-MM
        if (!month) return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
        
        const employees = await Employee.find();
        const results = [];
        
        for (const emp of employees) {
            // Find attendance for this month
            const attendanceRecords = await Attendance.find({ 
                employeeId: emp._id, 
                date: { $regex: `^${month}` } 
            });
            
            let totalWorkedHours = 0;
            attendanceRecords.forEach(record => {
                totalWorkedHours += (record.totalHours || 0);
            });
            
            // Basic Payroll Logic
            // In a real app, this would account for exactly how many days they worked vs expected
            // Here we use basic Salary + allowances + (overtime if applicable)
            
            // Expected hours ~ 22 days * dailyWorkHours
            const expectedHours = 22 * (emp.dailyWorkHours || 8);
            let overtimeHours = totalWorkedHours > expectedHours ? (totalWorkedHours - expectedHours) : 0;
            let overtimePay = overtimeHours * (emp.overtimeRatePerHour || 0);
            
            let deductions = 0;
            // E.g., if totalWorkedHours is significantly less than expected, calculate absence deduction
            if (totalWorkedHours < expectedHours && attendanceRecords.length > 0) {
                const missedHours = expectedHours - totalWorkedHours;
                const hourlyRate = emp.basicSalary / expectedHours;
                deductions = missedHours * hourlyRate;
            }
            
            const netSalary = emp.basicSalary + (emp.allowance || 0) + overtimePay - deductions;
            
            // Upsert the payroll run
            const payrollData = {
                employeeId: emp._id,
                month,
                basicSalary: emp.basicSalary,
                totalAllowances: emp.allowance || 0,
                totalOvertimeHours: Number(overtimeHours.toFixed(2)),
                totalOvertimePay: Number(overtimePay.toFixed(2)),
                deductions: Number(deductions.toFixed(2)),
                netSalary: Number(netSalary.toFixed(2))
            };
            
            const run = await PayrollRun.findOneAndUpdate(
                { employeeId: emp._id, month },
                payrollData,
                { new: true, upsert: true }
            );
            
            results.push(run);
        }
        
        res.json({ message: 'Payroll calculated successfully', data: results });
    } catch (error) {
        res.status(400).json({ message: 'Error calculating payroll', error: error.message });
    }
});

router.put('/payroll/pay/:id', async (req, res) => {
    try {
        const PayrollRun = req.tenantConnection.model('PayrollRun');
        const run = await PayrollRun.findByIdAndUpdate(req.params.id, {
            isPaid: true,
            paidAt: new Date()
        }, { new: true });
        res.json(run);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment status', error: error.message });
    }
});

module.exports = router;
