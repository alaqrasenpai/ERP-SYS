const getDashboardStats = async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        const Category = req.tenantConnection.model('Category');
        const StockMovement = req.tenantConnection.model('StockMovement');

        // Fetch counts and aggregations concurrently
        const [
            totalItems,
            totalCategories,
            lowStockAlerts,
            inventoryValueAgg,
            recentMovements,
            topCategoriesAgg
        ] = await Promise.all([
            Product.countDocuments(),
            Category.countDocuments(),
            Product.countDocuments({ $expr: { $lte: [{ $ifNull: ['$stockQuantity', 0] }, { $ifNull: ['$alertQuantity', 0] }] } }),
            Product.aggregate([
                { $group: { _id: null, total: { $sum: { $multiply: [{ $ifNull: ['$stockQuantity', 0] }, { $ifNull: ['$unitPrice', 0] }] } } } }
            ]),
            StockMovement.find().populate('productId', 'name').sort({ createdAt: -1 }).limit(4),
            Product.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 4 }
            ])
        ]);

        const inventoryValue = inventoryValueAgg.length > 0 ? inventoryValueAgg[0].total : 0;
        
        // Mock pending movements
        const pendingMovements = 0; 

        res.json({
            metrics: {
                totalItems,
                totalCategories,
                lowStockAlerts,
                inventoryValue,
                pendingMovements
            },
            recentMovements: recentMovements.map(m => ({
                id: m._id,
                itemName: m.productId ? m.productId.name : 'Unknown',
                type: m.type,
                quantity: m.quantity
            })),
            topCategories: topCategoriesAgg.map(c => ({
                name: c._id || 'Uncategorized',
                percentage: totalItems > 0 ? Math.round((c.count / totalItems) * 100) : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating Inventory dashboard summary', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
