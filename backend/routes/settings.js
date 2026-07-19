const express = require('express');
const router = express.Router();

// GET /api/settings - Fetch global settings
router.get('/', async (req, res) => {
    try {
        const Setting = req.tenantConnection.model('Setting');
        let settings = await Setting.findOne();
        
        // Singleton pattern: Create default if it doesn't exist
        if (!settings) {
            settings = await Setting.create({});
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});

// PUT /api/settings - Update global settings
router.put('/', async (req, res) => {
    try {
        const Setting = req.tenantConnection.model('Setting');
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findOneAndUpdate({}, req.body, { new: true });
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
});
// POST /api/settings/seed - Generate Dummy Data for testing
router.post('/seed', async (req, res) => {
    try {
        const Employee = req.tenantConnection.model('Employee');
        const Department = req.tenantConnection.model('Department');
        const Shift = req.tenantConnection.model('Shift');
        const Attendance = req.tenantConnection.model('Attendance');
        const Product = req.tenantConnection.model('Product');
        const StockMovement = req.tenantConnection.model('StockMovement');

        // 1. Create Dummy Department & Shift
        let dept = await Department.findOne({ name: 'Test Department' });
        if (!dept) dept = await Department.create({ name: 'Test Department', code: 'TEST_DEPT' });

        let shift = await Shift.findOne({ name: 'Test Shift' });
        if (!shift) shift = await Shift.create({ name: 'Test Shift', startTime: '09:00', endTime: '17:00', dailyHours: 8, gracePeriodMinutes: 15 });

        // 2. Create Dummy Employees
        const newEmployees = [];
        for (let i = 1; i <= 20; i++) {
            const empName = `Test Employee ${i}`;
            const existing = await Employee.findOne({ name: empName });
            if (!existing) {
                newEmployees.push({
                    name: empName,
                    email: `test_emp${i}@alaqra.dev`,
                    nationalId: `123456789${i}`,
                    departmentId: dept._id,
                    shiftId: shift._id,
                    position: 'Employee',
                    basicSalary: 3000 + (i * 100),
                    joinedAt: new Date(),
                    annualLeaveBalance: 14
                });
            }
        }
        
        let insertedEmployees = [];
        if (newEmployees.length > 0) {
            insertedEmployees = await Employee.insertMany(newEmployees);
        } else {
            insertedEmployees = await Employee.find({ departmentId: dept._id });
        }

        // 3. Create Dummy Attendance (Past 5 days)
        const attendanceLogs = [];
        const today = new Date();
        for (let i = 1; i <= 5; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            for (const emp of insertedEmployees) {
                const rand = Math.random();
                let status = 'Present';
                let clockIn = new Date(d);
                clockIn.setHours(9, 0, 0, 0); // Default 9 AM
                
                let clockOut = new Date(d);
                clockOut.setHours(17, 0, 0, 0); // Default 5 PM

                if (rand < 0.1) {
                    status = 'Absent';
                    clockIn = null;
                    clockOut = null;
                } else if (rand < 0.3) {
                    status = 'Late';
                    clockIn.setHours(9, 30, 0, 0); // Late by 30 mins
                }

                if (status !== 'Absent') {
                    // 10% chance of early exit
                    if (Math.random() < 0.1) {
                        clockOut.setHours(16, 0, 0, 0); // Leave at 4 PM
                    }
                    
                    const diffMs = clockOut - clockIn;
                    const totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

                    attendanceLogs.push({
                        employeeId: emp._id,
                        date: dateStr,
                        clockIn,
                        clockOut,
                        status,
                        totalHours,
                        punchInType: 'Web',
                        punchOutType: 'Web'
                    });
                }
            }
        }
        await Attendance.insertMany(attendanceLogs);

        // 4. Create Dummy Products
        const newProducts = [];
        for (let i = 1; i <= 20; i++) {
            const productName = `Test Product ${i}`;
            const existing = await Product.findOne({ name: productName });
            if (!existing) {
                newProducts.push({
                    name: productName,
                    sku: `SKU-TEST-${i}`,
                    category: 'Test Category',
                    unitPrice: 10 * i,
                    purchasePrice: 5 * i,
                    stockQuantity: 0
                });
            }
        }
        
        let insertedProducts = [];
        if (newProducts.length > 0) {
            insertedProducts = await Product.insertMany(newProducts);
        } else {
            insertedProducts = await Product.find({ category: 'Test Category' });
        }

        // 5. Create Dummy Stock Movements
        const txs = [];
        for (const item of insertedProducts) {
            txs.push({
                productId: item._id,
                type: 'in',
                quantity: 100,
                unitCost: item.purchasePrice,
                totalCost: item.purchasePrice * 100,
                reason: 'Initial Seed',
                referenceNumber: 'SEED-' + Math.floor(Math.random() * 10000),
                date: new Date()
            });
            await Product.findByIdAndUpdate(item._id, { $inc: { stockQuantity: 100 } });
        }
        if (txs.length > 0) await StockMovement.insertMany(txs);

        res.json({ message: 'Test data generated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating test data', error: error.message });
    }
});


module.exports = router;
