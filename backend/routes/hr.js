const express = require('express');
const router = express.Router();

// ----------------------------------------
// Employee Routes
// ----------------------------------------
router.get('/employees', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const employees = await Employee.find().sort({ createdAt: -1 });
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
