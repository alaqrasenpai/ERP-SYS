const { getModels } = require('./utils');

exports.getPayrollRuns = async (req, res) => {
    try {
        const { PayrollRun } = getModels(req);
        const runs = await PayrollRun.find().populate('employeeId').sort({ month: -1 });
        res.json(runs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payroll runs', error: error.message });
    }
};

exports.calculatePayroll = async (req, res) => {
    try {
        const { Employee, Attendance, PayrollRun } = getModels(req);
        
        const { month } = req.body; // YYYY-MM
        if (!month) return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
        
        const employees = await Employee.find();
        const results = [];
        
        for (const emp of employees) {
            const attendanceRecords = await Attendance.find({ 
                employeeId: emp._id, 
                date: { $regex: `^${month}` } 
            });
            
            let totalWorkedHours = 0;
            attendanceRecords.forEach(record => {
                totalWorkedHours += (record.totalHours || 0);
            });
            
            const expectedHours = 22 * (emp.dailyWorkHours || 8);
            let overtimeHours = totalWorkedHours > expectedHours ? (totalWorkedHours - expectedHours) : 0;
            let overtimePay = overtimeHours * (emp.overtimeRatePerHour || 0);
            
            let deductions = 0;
            if (totalWorkedHours < expectedHours && attendanceRecords.length > 0) {
                const missedHours = expectedHours - totalWorkedHours;
                const hourlyRate = emp.basicSalary / expectedHours;
                deductions = missedHours * hourlyRate;
            }
            
            const netSalary = emp.basicSalary + (emp.allowance || 0) + overtimePay - deductions;
            
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
};

exports.payPayroll = async (req, res) => {
    try {
        const { PayrollRun } = getModels(req);
        const run = await PayrollRun.findByIdAndUpdate(req.params.id, {
            isPaid: true,
            paidAt: new Date()
        }, { new: true });
        res.json(run);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment status', error: error.message });
    }
};
