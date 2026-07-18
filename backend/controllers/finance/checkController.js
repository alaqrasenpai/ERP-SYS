const { getModels, ensureDefaultAccounts } = require('./utils');

exports.getChecks = async (req, res) => {
    try {
        const { CheckPayment } = getModels(req);
        const checks = await CheckPayment.find().populate('customerId', 'name').populate('orderId', 'orderNumber').sort({ dueDate: 1 });
        res.json(checks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checks', error: error.message });
    }
};

exports.updateCheckStatus = async (req, res) => {
    try {
        const { CheckPayment, Customer, DebtLog, Account, JournalEntry } = getModels(req);
        const { status } = req.body;

        const check = await CheckPayment.findById(req.params.id);
        if (!check) return res.status(404).json({ message: 'Check not found' });
        
        if (check.status === status) return res.status(400).json({ message: 'Check is already in this status' });

        check.status = status;
        await check.save();

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
};
