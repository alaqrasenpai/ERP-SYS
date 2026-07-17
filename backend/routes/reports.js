const express = require('express');
const router = express.Router();

// GET /api/reports/profit-and-loss
router.get('/profit-and-loss', async (req, res) => {
    try {
        const JournalEntry = req.tenantConnection.model('JournalEntry');
        const Account = req.tenantConnection.model('Account');
        
        const { startDate, endDate } = req.query;
        let matchStage = {};
        
        if (startDate && endDate) {
            matchStage = {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Fetch relevant accounts (Revenue, Expense, COGS)
        const revenueAccounts = await Account.find({ type: 'Revenue' }).select('_id');
        const expenseAccounts = await Account.find({ type: 'Expense' }).select('_id');
        
        const revenueIds = revenueAccounts.map(a => a._id.toString());
        const expenseIds = expenseAccounts.map(a => a._id.toString());

        const entries = await JournalEntry.find(matchStage).populate('lines.accountId');
        
        let totalRevenue = 0;
        let totalCOGSAndExpenses = 0;

        for (const entry of entries) {
            for (const line of entry.lines) {
                if (!line.accountId) continue;
                const accId = line.accountId._id.toString();
                const accType = line.accountId.type;
                
                // Revenue is increased by Credit
                if (accType === 'Revenue') {
                    totalRevenue += line.credit;
                    totalRevenue -= line.debit; // just in case there are returns
                }
                
                // Expenses (including COGS) are increased by Debit
                if (accType === 'Expense') {
                    totalCOGSAndExpenses += line.debit;
                    totalCOGSAndExpenses -= line.credit; // refunds/adjustments
                }
            }
        }

        const netProfit = totalRevenue - totalCOGSAndExpenses;

        res.json({
            totalRevenue,
            totalCostAndExpenses: totalCOGSAndExpenses,
            netProfit
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating P&L report', error: error.message });
    }
});

// GET /api/reports/debtors-summary
router.get('/debtors-summary', async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const InstallmentPlan = req.tenantConnection.model('InstallmentPlan');

        // Get customers with debt, sorted highest to lowest
        const customers = await Customer.find({ totalDebt: { $gt: 0 } }).sort({ totalDebt: -1 }).lean();
        
        // Fetch installment plans for these customers to flag overdue
        for (let customer of customers) {
            const plans = await InstallmentPlan.find({ customerId: customer._id, 'installments.status': { $in: ['Pending', 'Overdue'] } });
            
            let overdueInstallments = 0;
            let overdueAmount = 0;
            const now = new Date();

            for (const plan of plans) {
                for (const inst of plan.installments) {
                    if (inst.status !== 'Paid' && new Date(inst.dueDate) < now) {
                        overdueInstallments++;
                        overdueAmount += inst.amount;
                    }
                }
            }
            customer.overdueInstallmentsCount = overdueInstallments;
            customer.overdueAmount = overdueAmount;
            customer.hasOverdue = overdueInstallments > 0;
        }

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error generating Debtors report', error: error.message });
    }
});

// GET /api/reports/inventory-valuation
router.get('/inventory-valuation', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        
        const result = await Product.aggregate([
            {
                $project: {
                    value: { $multiply: ["$stockQuantity", { $ifNull: ["$purchasePrice", 0] }] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: "$value" }
                }
            }
        ]);

        res.json({
            totalInventoryValue: result.length > 0 ? result[0].totalValue : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating Inventory Valuation report', error: error.message });
    }
});

module.exports = router;
