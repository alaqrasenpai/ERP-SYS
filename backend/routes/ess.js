const express = require('express');
const router = express.Router();

// Middleware to resolve the linked Employee for the authenticated User
const requireEmployeeProfile = async (req, res, next) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const User = req.tenantConnection.model('User');
        
        // Find User to get employeeId (in case it's newly linked or req.user lacks it)
        const userRec = await User.findById(req.user.id || req.user._id);
        
        let employee = null;
        if (userRec && userRec.employeeId) {
            employee = await Employee.findById(userRec.employeeId).populate('departmentId').populate('shiftId');
        } else {
            // Fallback: try to link by email automatically
            employee = await Employee.findOne({ email: req.user.email }).populate('departmentId').populate('shiftId');
            if (employee && userRec) {
                userRec.employeeId = employee._id;
                await userRec.save();
            }
        }

        if (!employee) {
            return res.status(404).json({ message: 'No employee profile linked to this account.' });
        }
        
        req.employee = employee;
        next();
    } catch (err) {
        res.status(500).json({ message: 'Error resolving employee profile', error: err.message });
    }
};

// GET /api/ess/my-profile
router.get('/my-profile', requireEmployeeProfile, (req, res) => {
    res.json(req.employee);
});

// GET /api/ess/my-attendance
router.get('/my-attendance', requireEmployeeProfile, async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const { month } = req.query; // YYYY-MM
        
        let filter = { employeeId: req.employee._id };
        if (month) {
            filter.date = { $regex: `^${month}` };
        }
        
        const logs = await Attendance.find(filter).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

// POST /api/ess/my-attendance/punch
router.post('/my-attendance/punch', requireEmployeeProfile, async (req, res) => {
    try {
        const Attendance = req.tenantConnection.model('Attendance');
        const employee = req.employee;
        const { type } = req.body; // 'in' or 'out'
        
        const punchTime = new Date();
        const todayStr = punchTime.toISOString().split('T')[0];
        
        let attendance = await Attendance.findOne({ employeeId: employee._id, date: todayStr });
        
        if (type === 'in') {
            if (attendance && attendance.clockIn) return res.status(400).json({ message: 'Already clocked in today' });
            if (!attendance) {
                attendance = new Attendance({ employeeId: employee._id, date: todayStr, punchInType: 'Web', status: 'Present' });
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
            
            if (employee.shiftId && employee.shiftId.dailyHours) {
                if (attendance.totalHours > employee.shiftId.dailyHours) {
                    attendance.overtimeHours = Number((attendance.totalHours - employee.shiftId.dailyHours).toFixed(2));
                    attendance.overtimeStatus = 'Pending Approval';
                }
            }
            await attendance.save();
        }
        res.status(200).json(attendance);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// GET /api/ess/my-leaves
router.get('/my-leaves', requireEmployeeProfile, async (req, res) => {
    try {
        const LeaveRequest = req.tenantConnection.model('LeaveRequest');
        const leaves = await LeaveRequest.find({ employeeId: req.employee._id })
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/ess/my-leaves/request
router.post('/my-leaves/request', requireEmployeeProfile, async (req, res) => {
    try {
        const LeaveRequest = req.tenantConnection.model('LeaveRequest');
        const Holiday = req.tenantConnection.model('Holiday');
        const employee = req.employee;

        const { type, startDate, endDate, startTime, endTime, reason } = req.body;
        
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
            employeeId: employee._id, 
            type, 
            startDate, 
            endDate, 
            startTime, 
            endTime, 
            totalDays, 
            totalHours, 
            reason, 
            status: 'Pending'
        });

        res.status(201).json(leave);
    } catch (error) { 
        res.status(400).json({ message: error.message }); 
    }
});

module.exports = router;
