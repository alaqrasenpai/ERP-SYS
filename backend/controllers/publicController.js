const { getModels } = require('./restaurant/utils');
const Tenant = require('../models/Tenant');

exports.getPublicMenu = async (req, res) => {
    try {
        const { MenuCategory, MenuItem } = getModels(req);
        
        const categories = await MenuCategory.find({ isActive: true }).sort('order');
        const items = await MenuItem.find({ isAvailable: true });

        // Get tenant configuration for logo and name
        const tenantSettings = req.tenantConfig;

        res.json({
            restaurantName: tenantSettings.name,
            categories,
            items
        });
    } catch (err) {
        console.error('Error fetching public menu:', err);
        res.status(500).json({ error: 'Failed to fetch public menu' });
    }
};
