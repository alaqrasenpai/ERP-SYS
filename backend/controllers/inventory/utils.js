const getModels = (req) => {
    return {
        Category: req.tenantConnection.model('Category'),
        Product: req.tenantConnection.model('Product'),
        Warehouse: req.tenantConnection.model('Warehouse'),
        Supplier: req.tenantConnection.model('Supplier'),
        StockMovement: req.tenantConnection.model('StockMovement'),
        Account: req.tenantConnection.model('Account'),
        JournalEntry: req.tenantConnection.model('JournalEntry')
    };
};

module.exports = { getModels };
