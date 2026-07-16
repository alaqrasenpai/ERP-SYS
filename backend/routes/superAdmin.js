const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { getTenantConnection } = require('../config/tenant-db');

// @desc    Register a new tenant (company) and create its first Admin user
// @route   POST /api/super/tenants
// @access  Private/SuperAdmin (Authentication should be added here in production)
router.post('/tenants', async (req, res) => {
    try {
        const { name, tenantId, dbName, enabledModules, adminName, adminEmail, adminPassword } = req.body;

        // Validation
        if (!name || !tenantId || !dbName) {
            return res.status(400).json({ message: 'Please provide name, tenantId, and dbName' });
        }
        
        if (!adminName || !adminEmail || !adminPassword) {
            return res.status(400).json({ message: 'Please provide adminName, adminEmail, and adminPassword for the first user' });
        }

        // Check if tenant already exists
        const tenantExists = await Tenant.findOne({ $or: [{ tenantId }, { dbName }] });
        if (tenantExists) {
            return res.status(400).json({ message: 'Tenant with this ID or Database name already exists' });
        }

        // Create new tenant
        const newTenant = await Tenant.create({
            name,
            tenantId,
            dbName,
            enabledModules: enabledModules || []
        });

        // Setup the tenant database and create the first Admin user
        const tenantConnection = getTenantConnection(dbName);
        const User = tenantConnection.model('User');
        const Role = tenantConnection.model('Role');

        // Create the Admin role
        let adminRole = await Role.findOne({ name: 'Admin' });
        if (!adminRole) {
            adminRole = await Role.create({
                name: 'Admin',
                permissions: ['*'] // Full permissions
            });
        }

        // Create the first user
        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: adminRole._id
        });

        res.status(201).json({
            message: 'Tenant and first Admin user created successfully',
            tenant: newTenant,
            adminUser: {
                name: adminUser.name,
                email: adminUser.email
            }
        });
    } catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({ message: 'Server Error while creating tenant' });
    }
});

module.exports = router;
