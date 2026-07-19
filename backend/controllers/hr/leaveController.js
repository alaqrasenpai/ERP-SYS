const { getModels } = require('./utils');

exports.getLeaves = async (req, res) => {
    try {
        const { LeaveRequest } = getModels(req);
        const leaves = await LeaveRequest.find().populate('employeeId').populate('approvedBy').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.requestLeave = async (req, res) => {
    try {
        const { LeaveRequest, Employee, Holiday } = getModels(req);

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
};

exports.approveLeave = async (req, res) => {
    try {
        const { LeaveRequest, Employee } = getModels(req);
        
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });
        if (leave.status === 'Approved') return res.status(400).json({ message: 'Already approved' });
        
        const employee = await Employee.findById(leave.employeeId);
        
        if (req.body.status === 'Approved') {
            if (leave.type === 'Hourly Departure') {
                employee.accumulatedLeaveHours += leave.totalHours;
                const workHours = employee.dailyWorkHours || 8;
                if (employee.accumulatedLeaveHours >= workHours) {
                    const daysToDeduct = Math.floor(employee.accumulatedLeaveHours / workHours);
                    employee.accumulatedLeaveHours -= (daysToDeduct * workHours);
                    
                    if (employee.annualLeaveBalance >= daysToDeduct) {
                        employee.annualLeaveBalance -= daysToDeduct;
                    } else {
                        const remainingDays = daysToDeduct - employee.annualLeaveBalance;
                        employee.annualLeaveBalance = 0;
                        employee.pendingSalaryDeductionDays += remainingDays;
                    }
                }
            } else if (leave.type === 'Annual') {
                employee.annualLeaveBalance -= leave.totalDays;
            } else if (leave.type === 'Sick') {
                employee.sickLeaveBalance -= leave.totalDays;
            }
            await employee.save();
        }
        
        leave.status = req.body.status;
        leave.managerNotes = req.body.managerNotes;
        leave.approvedBy = req.user ? (req.user.id || req.user._id) : null;
        await leave.save();
        
        res.json(leave);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
