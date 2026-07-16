const express = require('express');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});

// Create a customer
router.post('/', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating customer', error: error.message });
    }
});

// Update a customer
router.put('/:id', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: 'Error updating customer', error: error.message });
    }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting customer', error: error.message });
    }
});

// Get Debt Logs for a customer
router.get('/:id/debt-logs', async (req, res) => {
    try {
        const DebtLog = req.tenantConnection.model('DebtLog');
        const logs = await DebtLog.find({ customerId: req.params.id }).populate('orderId', 'orderNumber grandTotal').sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching debt logs', error: error.message });
    }
});

// Manual Debt Adjustment (e.g. paying off a debt outside of an order)
router.post('/debt-adjust', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const DebtLog = req.tenantConnection.model('DebtLog');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');

        const { customerId, type, amount, notes, paymentMethod } = req.body;
        if (!customerId || !type || !amount) return res.status(400).json({ message: 'Missing required fields' });

        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        // Update customer totalDebt
        const amountNum = Number(amount);
        if (type === 'payment') {
            customer.totalDebt -= amountNum;
        } else {
            customer.totalDebt += amountNum;
        }
        await customer.save();

        // Log the debt adjustment
        const log = await DebtLog.create({
            customerId,
            type,
            amount: amountNum,
            paymentMethod: paymentMethod || 'Cash',
            notes
        });

        // Accounting Side-Effects
        // Ensure default accounts exist
        let cashAcc = await Account.findOne({ code: '1000' });
        let arAcc = await Account.findOne({ code: '1200' });
        if (cashAcc && arAcc && type === 'payment') {
            // A debt payment means we got cash, and AR decreased
            const entryCount = await JournalEntry.countDocuments();
            await JournalEntry.create({
                entryNumber: `JE-${Date.now()}-${entryCount + 1}`,
                description: `Debt Payment from ${customer.name} - ${notes || 'Manual Adjust'}`,
                lines: [
                    { accountId: cashAcc._id, debit: amountNum, credit: 0 },
                    { accountId: arAcc._id, debit: 0, credit: amountNum }
                ]
            });
            // Update account balances
            await Account.findByIdAndUpdate(cashAcc._id, { $inc: { balance: amountNum } }); // Asset increases with debit
            await Account.findByIdAndUpdate(arAcc._id, { $inc: { balance: -amountNum } }); // Asset decreases with credit
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: 'Error adjusting debt', error: error.message });
    }
});

module.exports = router;
