const getModels = (req) => {
    return {
        Account: req.tenantConnection.model('Account'),
        JournalEntry: req.tenantConnection.model('JournalEntry'),
        CheckPayment: req.tenantConnection.model('CheckPayment'),
        Customer: req.tenantConnection.model('Customer'),
        DebtLog: req.tenantConnection.model('DebtLog'),
        InstallmentPlan: req.tenantConnection.model('InstallmentPlan')
    };
};

async function ensureDefaultAccounts(req) {
    const { Account } = getModels(req);
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

module.exports = { getModels, ensureDefaultAccounts };
