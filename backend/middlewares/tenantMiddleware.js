const Tenant = require('../models/Tenant');
const { getTenantConnection } = require('../config/db');

const tenantMiddleware = async (req, res, next) => {
    // Extract tenant identifier from headers (e.g., x-tenant-id) or subdomain
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required in headers (x-tenant-id)' });
    }

    try {
        // Find the tenant in the master database
        const tenant = await Tenant.findOne({ _id: tenantId, isActive: true });
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or inactive' });
        }

        // Establish/Get connection to the tenant's specific database
        const tenantDbConnection = getTenantConnection(tenant.dbName);

        // Attach tenant info and db connection to the request object
        req.tenant = tenant;
        req.tenantDbConnection = tenantDbConnection;

        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ message: 'Internal Server Error verifying tenant' });
    }
};

module.exports = tenantMiddleware;
