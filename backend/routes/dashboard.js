const express = require('express');
const router = express.Router();

router.get('/summary', async (req, res) => {
    try {
        const Order = req.tenantConnection.model('Order');
        const RestaurantOrder = req.tenantConnection.model('RestaurantOrder');
        const Product = req.tenantConnection.model('Product');
        const Employee = req.tenantConnection.model('Employee');
        const PayrollRun = req.tenantConnection.model('PayrollRun');
        const File = req.tenantConnection.model('File');
        const StockMovement = req.tenantConnection.model('StockMovement');

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthString = now.toISOString().substring(0, 7);

        // Run queries concurrently
        const [
            todayOrders,
            monthOrders,
            todayRestOrders,
            monthRestOrders,
            lowStockProducts,
            totalEmployees,
            monthPayrollRuns,
            recentFiles,
            recentMovements,
            recentOrders
        ] = await Promise.all([
            Order.aggregate([{ $match: { createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
            Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
            RestaurantOrder.aggregate([{ $match: { createdAt: { $gte: startOfDay }, status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$financials.grandTotal' } } }]),
            RestaurantOrder.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$financials.grandTotal' } } }]),
            Product.find({ $expr: { $lte: ['$stockQuantity', { $ifNull: ['$alertQuantity', 0] }] } }), // Products where stock <= alertQuantity
            Employee.countDocuments(),
            PayrollRun.aggregate([{ $match: { month: currentMonthString } }, { $group: { _id: null, totalPayroll: { $sum: '$netSalary' } } }]),
            File.find().sort({ createdAt: -1 }).limit(5),
            StockMovement.find().populate('productId', 'name').sort({ createdAt: -1 }).limit(5),
            Order.find().sort({ createdAt: -1 }).limit(5)
        ]);

        const posToday = todayOrders.length > 0 ? todayOrders[0].total : 0;
        const posMonth = monthOrders.length > 0 ? monthOrders[0].total : 0;
        const restToday = todayRestOrders.length > 0 ? todayRestOrders[0].total : 0;
        const restMonth = monthRestOrders.length > 0 ? monthRestOrders[0].total : 0;

        const todayRevenue = posToday + restToday;
        const monthRevenue = posMonth + restMonth;
        const projectedPayroll = monthPayrollRuns.length > 0 ? monthPayrollRuns[0].totalPayroll : 0;

        res.json({
            metrics: {
                todayRevenue,
                monthRevenue,
                lowStockCount: lowStockProducts.length,
                totalEmployees,
                projectedPayroll
            },
            alerts: lowStockProducts.map(p => ({
                id: p._id,
                message: `Low Stock Alert: ${p.name} has only ${p.stockQuantity} remaining!`,
                messageCode: 'low_stock',
                productName: p.name,
                quantity: p.stockQuantity,
                type: 'warning'
            })),
            activities: {
                files: recentFiles,
                movements: recentMovements,
                orders: recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating dashboard summary', error: error.message });
    }
});

module.exports = router;
