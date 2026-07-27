const getDashboardStats = async (req, res) => {
    try {
        const Order = req.tenantConnection.model('Order');
        const RestaurantOrder = req.tenantConnection.model('RestaurantOrder');
        const Table = req.tenantConnection.model('Table');

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Fetch counts and aggregations concurrently
        const [
            todayPosOrders,
            todayRestOrders,
            todayPosRevenueAgg,
            todayRestRevenueAgg,
            activeTables,
            totalTables,
            recentOrders
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: startOfDay } }),
            RestaurantOrder.countDocuments({ createdAt: { $gte: startOfDay } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            RestaurantOrder.aggregate([
                { $match: { createdAt: { $gte: startOfDay }, status: 'Paid' } },
                { $group: { _id: null, total: { $sum: '$financials.grandTotal' } } }
            ]),
            Table.countDocuments({ status: 'Occupied' }),
            Table.countDocuments(),
            Order.find().sort({ createdAt: -1 }).limit(4)
        ]);

        const posRevenue = todayPosRevenueAgg.length > 0 ? todayPosRevenueAgg[0].total : 0;
        const restRevenue = todayRestRevenueAgg.length > 0 ? todayRestRevenueAgg[0].total : 0;
        const todaysSales = posRevenue + restRevenue;
        
        const totalOrders = todayPosOrders + todayRestOrders;

        // Mock pending kitchen orders
        const pendingKitchen = 0; 
        const avgPrepMins = 14; 

        res.json({
            metrics: {
                todaysSales,
                totalOrders,
                activeTables,
                totalTables,
                pendingKitchen,
                avgPrepMins
            },
            recentOrders: recentOrders.map(o => ({
                id: o._id,
                orderNumber: o.orderNumber,
                type: o.orderType || 'POS',
                itemsCount: o.items ? o.items.length : 0,
                total: o.grandTotal
            })),
            topSellingItems: [
                { name: 'Item 1', orders: 40 },
                { name: 'Item 2', orders: 35 },
                { name: 'Item 3', orders: 30 },
                { name: 'Item 4', orders: 25 }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating POS dashboard summary', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
