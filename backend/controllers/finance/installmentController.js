const { getModels, ensureDefaultAccounts } = require('./utils');

exports.getInstallments = async (req, res) => {
    try {
        const { InstallmentPlan } = getModels(req);
        const plans = await InstallmentPlan.find().populate('customerId', 'name').populate('orderId', 'orderNumber').sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching installments', error: error.message });
    }
};

exports.payInstallment = async (req, res) => {
    try {
        const { InstallmentPlan, Customer, DebtLog, Account, JournalEntry } = getModels(req);

        const plan = await InstallmentPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const inst = plan.installments.id(req.params.installmentId);
        if (!inst) return res.status(404).json({ message: 'Installment not found' });
        if (inst.status === 'Paid') return res.status(400).json({ message: 'Installment already paid' });

        inst.status = 'Paid';
        inst.paidDate = new Date();
        plan.remainingAmount -= inst.amount;

        await plan.save();

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
};
