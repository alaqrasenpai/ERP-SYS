const express = require('express');
const router = express.Router();

// Helper to ensure default accounts exist
async function ensureDefaultAccounts(req) {
    const Account = req.tenantConnection.model('Account');
    const defaults = [
        { code: '1000', name: 'Cash/Bank', type: 'Asset' },
        { code: '1200', name: 'Accounts Receivable', type: 'Asset' },
        { code: '1300', name: 'Inventory', type: 'Asset' },
        { code: '2000', name: 'Accounts Payable', type: 'Liability' },
        { code: '3000', name: 'Equity', type: 'Equity' },
        { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
        { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
        { code: '1100', name: 'Post-Dated Checks', type: 'Asset' }
    ];

    for (const def of defaults) {
        await Account.findOneAndUpdate({ code: def.code }, { $setOnInsert: def }, { upsert: true });
    }
}

// ----------------------------------------
// Accounting Routes
// ----------------------------------------
router.get('/accounts', async (req, res) => {
    try {
        await ensureDefaultAccounts(req);
        const Account = req.tenantConnection.model('Account');
        const accounts = await Account.find().sort({ code: 1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
});

router.get('/journal', async (req, res) => {
    try {
        const JournalEntry = req.tenantConnection.model('JournalEntry');
        const entries = await JournalEntry.find().populate('lines.accountId').sort({ date: -1 }).limit(100);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
    }
});

// ----------------------------------------
// Check Management Routes
// ----------------------------------------
router.get('/checks', async (req, res) => {
    try {
        const CheckPayment = req.tenantConnection.model('CheckPayment');
        const checks = await CheckPayment.find().populate('customerId', 'name').populate('orderId', 'orderNumber').sort({ dueDate: 1 });
        res.json(checks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checks', error: error.message });
    }
});

router.post('/checks/:id/status', async (req, res) => {
    try {
        const CheckPayment = req.tenantConnection.model('CheckPayment');
        const Customer = req.tenantConnection.model('Customer');
        const DebtLog = req.tenantConnection.model('DebtLog');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');
        const { status } = req.body;

        const check = await CheckPayment.findById(req.params.id);
        if (!check) return res.status(404).json({ message: 'Check not found' });
        
        if (check.status === status) return res.status(400).json({ message: 'Check is already in this status' });

        check.status = status;
        await check.save();

        // If collected, perform accounting: Debit Cash, Credit Post-Dated Checks
        if (status === 'Collected') {
            await ensureDefaultAccounts(req);
            const cashAcc = await Account.findOne({ code: '1000' });
            const checkAcc = await Account.findOne({ code: '1100' });
            
            if (cashAcc && checkAcc) {
                const entryCount = await JournalEntry.countDocuments();
                await JournalEntry.create({
                    entryNumber: `JE-${Date.now()}-${entryCount + 1}`,
                    description: `Check Collected - #${check.checkNumber}`,
                    lines: [
                        { accountId: cashAcc._id, debit: check.amount, credit: 0 },
                        { accountId: checkAcc._id, debit: 0, credit: check.amount }
                    ]
                });
                await Account.findByIdAndUpdate(cashAcc._id, { $inc: { balance: check.amount } });
                await Account.findByIdAndUpdate(checkAcc._id, { $inc: { balance: -check.amount } });
            }
        } else if (status === 'Bounced') {
            // Re-apply debt to customer
            const customer = await Customer.findById(check.customerId);
            if (customer) {
                customer.totalDebt += check.amount;
                await customer.save();

                await DebtLog.create({
                    customerId: customer._id,
                    orderId: check.orderId,
                    type: 'charge',
                    amount: check.amount,
                    paymentMethod: 'Check',
                    notes: `Bounced Check #${check.checkNumber}`
                });
            }
        }

        res.json(check);
    } catch (error) {
        res.status(400).json({ message: 'Error updating check status', error: error.message });
    }
});

// ----------------------------------------
// Installment Management Routes
// ----------------------------------------
router.get('/installments', async (req, res) => {
    try {
        const InstallmentPlan = req.tenantConnection.model('InstallmentPlan');
        const plans = await InstallmentPlan.find().populate('customerId', 'name').populate('orderId', 'orderNumber').sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching installments', error: error.message });
    }
});

router.post('/installments/:id/pay/:installmentId', async (req, res) => {
    try {
        const InstallmentPlan = req.tenantConnection.model('InstallmentPlan');
        const Customer = req.tenantConnection.model('Customer');
        const DebtLog = req.tenantConnection.model('DebtLog');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');

        const plan = await InstallmentPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const inst = plan.installments.id(req.params.installmentId);
        if (!inst) return res.status(404).json({ message: 'Installment not found' });
        if (inst.status === 'Paid') return res.status(400).json({ message: 'Installment already paid' });

        inst.status = 'Paid';
        inst.paidDate = new Date();
        plan.remainingAmount -= inst.amount;

        await plan.save();

        // Decrease customer debt
        const customer = await Customer.findById(plan.customerId);
        if (customer) {
            customer.totalDebt -= inst.amount;
            await customer.save();

            await DebtLog.create({
                customerId: customer._id,
                orderId: plan.orderId,
                type: 'payment',
                amount: inst.amount,
                paymentMethod: 'Installment',
                notes: `Installment Payment for Plan ID ${plan._id}`
            });
        }

        // Accounting: Debit Cash, Credit AR
        await ensureDefaultAccounts(req);
        const cashAcc = await Account.findOne({ code: '1000' });
        const arAcc = await Account.findOne({ code: '1200' });
        if (cashAcc && arAcc) {
            const entryCount = await JournalEntry.countDocuments();
            await JournalEntry.create({
                entryNumber: `JE-${Date.now()}-${entryCount + 1}`,
                description: `Installment Payment - Plan ${plan._id}`,
                lines: [
                    { accountId: cashAcc._id, debit: inst.amount, credit: 0 },
                    { accountId: arAcc._id, debit: 0, credit: inst.amount }
                ]
            });
            await Account.findByIdAndUpdate(cashAcc._id, { $inc: { balance: inst.amount } });
            await Account.findByIdAndUpdate(arAcc._id, { $inc: { balance: -inst.amount } });
        }

        res.json(plan);
    } catch (error) {
        res.status(400).json({ message: 'Error processing installment payment', error: error.message });
    }
});

module.exports = router;
