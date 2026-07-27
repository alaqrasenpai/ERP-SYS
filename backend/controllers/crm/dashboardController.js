const getDashboardStats = async (req, res) => {
    try {
        const Customer = req.tenantConnection.model('Customer');
        const Order = req.tenantConnection.model('Order');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch counts and aggregations concurrently
        const [
            totalCustomers,
            newCustomersThisMonth,
            totalOrders,
            totalRevenueAgg,
            topCustomers
        ] = await Promise.all([
            Customer.countDocuments(),
            Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({ status: { $ne: 'Cancelled' } }),
            Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Customer.find().sort({ createdAt: -1 }).limit(4) // Mock top customers by newest for now since revenue by customer needs more complex aggregation
        ]);

        const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;
        
        // Mocking churn rate
        const churnRate = 2.4; 

        res.json({
            metrics: {
                totalCustomers,
                newCustomersThisMonth,
                salesVolume: totalOrders,
                totalRevenue,
                churnRate
            },
            topCustomers: topCustomers.map(c => ({
                id: c._id,
                name: c.name,
                type: c.type || 'B2B',
                joined: new Date(c.createdAt).getFullYear(),
                revenue: 0 // Mock revenue
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating CRM dashboard summary', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
