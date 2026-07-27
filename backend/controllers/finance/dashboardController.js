const getDashboardStats = async (req, res) => {
    try {
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');

        // Fetch counts and aggregations concurrently
        const [
            totalAssetsAgg,
            totalRevenueAgg,
            totalExpensesAgg,
            recentTransactions
        ] = await Promise.all([
            Account.aggregate([
                { $match: { type: 'Asset' } },
                { $group: { _id: null, total: { $sum: '$balance' } } }
            ]),
            Account.aggregate([
                { $match: { type: 'Revenue' } },
                { $group: { _id: null, total: { $sum: '$balance' } } }
            ]),
            Account.aggregate([
                { $match: { type: 'Expense' } },
                { $group: { _id: null, total: { $sum: '$balance' } } }
            ]),
            JournalEntry.find({ status: 'Posted' })
                .sort({ date: -1 })
                .limit(4)
        ]);

        const totalAssets = totalAssetsAgg.length > 0 ? totalAssetsAgg[0].total : 0;
        const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;
        const totalExpenses = totalExpensesAgg.length > 0 ? totalExpensesAgg[0].total : 0;
        
        // Mock pending checks for now
        const pendingChecks = 0; 
        const profitMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;

        res.json({
            metrics: {
                totalAssets,
                totalRevenue,
                totalExpenses,
                pendingChecks,
                profitMargin
            },
            recentTransactions: recentTransactions.map(t => ({
                id: t._id,
                reference: t.reference || t.description,
                amount: t.totalDebit || 0,
                type: 'out' // Mock type
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating Finance dashboard summary', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
