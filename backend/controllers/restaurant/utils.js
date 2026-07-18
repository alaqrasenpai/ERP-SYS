const getModels = (req) => {
    return {
        DeliveryProvider: req.tenantConnection.model('DeliveryProvider'),
        RestaurantTable: req.tenantConnection.model('RestaurantTable'),
        MenuItem: req.tenantConnection.model('MenuItem'),
        RestaurantOrder: req.tenantConnection.model('RestaurantOrder'),
        MenuCategory: req.tenantConnection.model('MenuCategory'),
        TableSection: req.tenantConnection.model('TableSection'),
        Product: req.tenantConnection.model('Product'),
        Account: req.tenantConnection.model('Account'),
        JournalEntry: req.tenantConnection.model('JournalEntry')
    };
};

module.exports = { getModels };
