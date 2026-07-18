const { getModels } = require('./utils');

exports.getReport = async (req, res) => {
    try {
        const { Attendance } = getModels(req);
        const { month } = req.query; 
        let filter = {};
        if (month) filter.date = { $regex: `^${month}` };
        
        const logs = await Attendance.find(filter).populate('employeeId').sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

exports.clockIn = async (req, res) => {
    try {
        const { Attendance } = getModels(req);
        const { employeeId } = req.body;
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
                status: 'Present'
            });
        }
        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error clocking in', error: error.message });
    }
};

exports.clockOut = async (req, res) => {
    try {
        const { Attendance } = getModels(req);
        const { employeeId } = req.body;
        
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ employeeId, date: today });
        
        if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });
        if (attendance.clockOut) return res.status(400).json({ message: 'Already clocked out today' });
        
        attendance.clockOut = new Date();
        const diffMs = attendance.clockOut - attendance.clockIn;
        const diffHrs = diffMs / (1000 * 60 * 60);
        attendance.totalHours = Number(diffHrs.toFixed(2));
        
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error clocking out', error: error.message });
    }
};

exports.getDailyGrid = async (req, res) => {
    try {
        const { Attendance, Employee } = getModels(req);
        const { startDate, endDate, searchName } = req.query; 
        
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date();
        
        const filterStartDateStr = start.toISOString().split('T')[0];
        const filterEndDateStr = end.toISOString().split('T')[0];

        let employeeFilter = {};
        if (searchName) {
            employeeFilter.name = { $regex: searchName, $options: 'i' };
        }

        const employees = await Employee.find(employeeFilter).populate('departmentId').populate('shiftId');
        
        const attendances = await Attendance.find({ 
            date: { $gte: filterStartDateStr, $lte: filterEndDateStr } 
        }).lean();
        
        const grid = [];

        // Generate date array between start and end
        const dateArray = [];
        let currentDate = new Date(filterStartDateStr);
        const lastDate = new Date(filterEndDateStr);
        while (currentDate <= lastDate) {
            dateArray.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Cartesian product: employees x dates
        for (const dateStr of dateArray) {
            for (const emp of employees) {
                const att = attendances.find(a => a.employeeId.toString() === emp._id.toString() && a.date === dateStr);
                let status = att ? att.status : 'Absent';
                let isAnomalous = att ? att.isAnomalous : false;

                if (att && att.clockIn && !att.clockOut && emp.shiftId) {
                    const shiftEndParts = (emp.shiftId.endTime || "17:00").split(':').map(Number);
                    const shiftEnd = new Date(dateStr);
                    shiftEnd.setHours(shiftEndParts[0], shiftEndParts[1], 0, 0);
                    if (new Date() > shiftEnd) {
                        isAnomalous = true;
                    }
                }

                grid.push({
                    date: dateStr,
                    employee: { _id: emp._id, name: emp.name, code: emp.code },
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
                });
            }
        }

        // Sort grid by date descending, then employee name
        grid.sort((a, b) => {
            if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
            return a.employee.name.localeCompare(b.employee.name);
        });

        res.json(grid);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching daily grid', error: error.message });
    }
};

exports.createManualAttendance = async (req, res) => {
    try {
        const { Attendance, AttendanceAudit } = getModels(req);
        const { employeeId, date, clockIn, clockOut, reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required for manual attendance' });

        let totalHours = 0;
        if (clockIn && clockOut) {
            const diffMs = new Date(clockOut) - new Date(clockIn);
            totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        let attendance = await Attendance.findOne({ employeeId, date });

        if (attendance) {
            // Record exists, behave like override
            await AttendanceAudit.create({
                attendanceId: attendance._id,
                employeeId,
                modifiedBy: req.user.id || req.user._id,
                oldClockIn: attendance.clockIn,
                newClockIn: clockIn,
                oldClockOut: attendance.clockOut,
                newClockOut: clockOut,
                reason
            });

            attendance.clockIn = clockIn || attendance.clockIn;
            attendance.clockOut = clockOut || attendance.clockOut;
            if (clockIn) attendance.punchInType = 'Manual-HR';
            if (clockOut) attendance.punchOutType = 'Manual-HR';
            attendance.status = clockIn ? 'Present' : attendance.status;
            attendance.isAnomalous = false;

            if (attendance.clockIn && attendance.clockOut) {
                const diffMs = new Date(attendance.clockOut) - new Date(attendance.clockIn);
                attendance.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
            }

            await attendance.save();
            return res.status(200).json({ message: 'Attendance overridden successfully', attendance });
        }

        // Record does not exist, create it
        attendance = await Attendance.create({
            employeeId,
            date,
            clockIn,
            clockOut,
            status: clockIn ? 'Present' : 'Absent',
            punchInType: clockIn ? 'Manual-HR' : undefined,
            punchOutType: clockOut ? 'Manual-HR' : undefined,
            totalHours
        });

        await AttendanceAudit.create({
            attendanceId: attendance._id,
            employeeId,
            modifiedBy: req.user.id || req.user._id,
            oldClockIn: null,
            newClockIn: clockIn,
            oldClockOut: null,
            newClockOut: clockOut,
            reason
        });

        res.status(201).json({ message: 'Attendance created successfully', attendance });
    } catch (error) {
        console.error('Error creating manual attendance:', error);
        res.status(400).json({ message: 'Error creating manual attendance', error: error.message });
    }
};

exports.overrideAttendance = async (req, res) => {
    try {
        const { Attendance, AttendanceAudit } = getModels(req);
        const { newClockIn, newClockOut, reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required for manual override' });

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

        await AttendanceAudit.create({
            attendanceId: attendance._id,
            employeeId: attendance.employeeId,
            modifiedBy: req.user.id || req.user._id,
            oldClockIn: attendance.clockIn,
            newClockIn,
            oldClockOut: attendance.clockOut,
            newClockOut,
            reason
        });

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
        console.error('Error overriding attendance:', error);
        res.status(400).json({ message: 'Error overriding attendance', error: error.message });
    }
};

exports.approveOvertime = async (req, res) => {
    try {
        const { Attendance } = getModels(req);
        const { status } = req.body; 
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const attendance = await Attendance.findByIdAndUpdate(req.params.id, { overtimeStatus: status }, { new: true });
        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: 'Error updating overtime', error: error.message });
    }
};

exports.webPunch = async (req, res) => {
    try {
        const { Attendance, Employee } = getModels(req);
        const { type, employeeId } = req.body;
        
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
};

exports.biometricPunch = async (req, res) => {
    try {
        const { Attendance, Employee } = getModels(req);
        
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
};
