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
        const { Employee, Department, Shift, Attendance, Item, Category, InventoryTransaction } = require('../controllers/hr/utils').getModels(req);

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
                    role: 'Employee',
                    baseSalary: 3000 + (i * 100),
                    joinDate: new Date(),
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

        // 4. Create Dummy Categories & Items
        let cat = await Category.findOne({ name: 'Test Category' });
        if (!cat) cat = await Category.create({ name: 'Test Category', type: 'Inventory' });

        const newItems = [];
        for (let i = 1; i <= 20; i++) {
            const itemName = `Test Product ${i}`;
            const existing = await Item.findOne({ name: itemName });
            if (!existing) {
                newItems.push({
                    name: itemName,
                    sku: `SKU-TEST-${i}`,
                    categoryId: cat._id,
                    price: 10 * i,
                    cost: 5 * i,
                    type: 'Standard',
                    stock: 0
                });
            }
        }
        
        let insertedItems = [];
        if (newItems.length > 0) {
            insertedItems = await Item.insertMany(newItems);
        } else {
            insertedItems = await Item.find({ categoryId: cat._id });
        }

        // 5. Create Dummy Inventory Transactions
        const txs = [];
        for (const item of insertedItems) {
            txs.push({
                itemId: item._id,
                type: 'IN',
                quantity: 100,
                reference: 'Initial Seed',
                date: new Date()
            });
            await Item.findByIdAndUpdate(item._id, { $inc: { stock: 100 } });
        }
        if (txs.length > 0) await InventoryTransaction.insertMany(txs);

        res.json({ message: 'Test data generated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating test data', error: error.message });
    }
});

module.exports = router;
