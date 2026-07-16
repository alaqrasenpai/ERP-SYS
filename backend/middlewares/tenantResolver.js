const Tenant = require('../models/Tenant');
const { getTenantConnection } = require('../config/tenant-db');

const tenantResolver = async (req, res, next) => {
    // Read the tenant identifier from the header
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required (x-tenant-id header)' });
    }

    try {
        // Query the central admin database to verify the tenant
        const tenant = await Tenant.findOne({ tenantId });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        if (tenant.status !== 'active') {
            return res.status(403).json({ message: 'Tenant account is suspended' });
        }

        // Retrieve or create the correct connection object for this tenant
        const tenantConnection = getTenantConnection(tenant.dbName);

        // Attach configuration and connection object to the request
        req.tenantConfig = tenant;
        req.tenantConnection = tenantConnection;

        next();
    } catch (error) {
        console.error('Error in tenant resolver:', error);
        res.status(500).json({ message: 'Internal Server Error verifying tenant' });
    }
};

module.exports = tenantResolver;
