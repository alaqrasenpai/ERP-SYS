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

exports.getTenantInfo = async (req, res) => {
    try {
        const tenantId = req.params.tenantId;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const tenant = await Tenant.findOne({ tenantId, status: 'active' });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found or inactive' });
        }

        const { getTenantConnection } = require('../config/tenant-db');
        const tenantConnection = getTenantConnection(tenant.dbName);
        const Setting = tenantConnection.model('Setting');
        const settings = await Setting.findOne();

        res.json({ name: tenant.name, logoUrl: settings?.logoUrl || null });
    } catch (err) {
        console.error('Error fetching tenant info:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
