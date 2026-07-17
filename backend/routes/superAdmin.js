const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const { getTenantConnection } = require('../config/tenant-db');
const { superAdminAuth } = require('../middlewares/superAdminAuth');

// POST /api/super/login - Super Admin Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const superEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@erp.saas';
    const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'supersecret';

    if (email === superEmail && password === superPassword) {
        const token = jwt.sign(
            { role: 'SUPER_ADMIN', email: superEmail },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, message: 'Super Admin logged in successfully' });
    } else {
        res.status(401).json({ message: 'Invalid Super Admin credentials' });
    }
});

// GET /api/super/tenants - List all stores (Tenants)
router.get('/tenants', superAdminAuth, async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants', error: error.message });
    }
});

// POST /api/super/tenants/onboard - Provision a new store
router.post('/tenants/onboard', superAdminAuth, async (req, res) => {
    try {
        const { storeName, tenantId, dbName, enabledModules, adminName, adminEmail, adminPassword } = req.body;

        // Validation
        if (!storeName || !tenantId || !dbName || !adminName || !adminEmail || !adminPassword) {
            return res.status(400).json({ message: 'Missing required onboarding fields.' });
        }

        // Check if tenant already exists in Master DB
        const tenantExists = await Tenant.findOne({ $or: [{ tenantId }, { dbName }] });
        if (tenantExists) {
            return res.status(400).json({ message: 'Tenant ID or Database name already exists.' });
        }

        // 1. Create new tenant record
        const newTenant = await Tenant.create({
            name: storeName,
            tenantId,
            dbName,
            enabledModules: enabledModules || []
        });

        // 2. Connect to the new tenant DB
        const tenantConnection = getTenantConnection(dbName);
        const User = tenantConnection.model('User');
        const Role = tenantConnection.model('Role');

        // 3. Create the "Store Admin" role
        let adminRole = await Role.findOne({ name: 'Store Admin' });
        if (!adminRole) {
            adminRole = await Role.create({
                name: 'Store Admin',
                permissions: ['*'] // Full permissions
            });
        }

        // 4. Hash password and create Primary Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: adminRole._id
        });

        res.status(201).json({
            message: 'Store provisioned successfully!',
            tenant: newTenant,
            adminEmail: adminUser.email
        });
    } catch (error) {
        console.error('Error in onboarding:', error);
        res.status(500).json({ message: 'Server Error during onboarding', error: error.message });
    }
});

// PUT /api/super/tenants/:id/status - Toggle tenant status
router.put('/tenants/:id/status', superAdminAuth, async (req, res) => {
    try {
        const { status } = req.body; // 'active' or 'suspended'
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json({ message: `Tenant status updated to ${status}`, tenant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating tenant status', error: error.message });
    }
});

// PUT /api/super/tenants/:id/modules - Update tenant modules
router.put('/tenants/:id/modules', superAdminAuth, async (req, res) => {
    try {
        const { enabledModules } = req.body;
        if (!Array.isArray(enabledModules)) {
            return res.status(400).json({ message: 'enabledModules must be an array' });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id, 
            { enabledModules }, 
            { new: true }
        );
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json({ message: 'Tenant modules updated successfully', tenant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating tenant modules', error: error.message });
    }
});

// GET /api/super/tenants/:id/users - Get all users for a specific tenant
router.get('/tenants/:id/users', superAdminAuth, async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const tenantConnection = getTenantConnection(tenant.dbName);
        const User = tenantConnection.model('User');
        
        // Exclude passwords from the response
        const users = await User.find().select('-password').populate('role', 'name');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant users', error: error.message });
    }
});

// PUT /api/super/tenants/:id/users/:userId - Update a specific tenant user (name, password)
router.put('/tenants/:id/users/:userId', superAdminAuth, async (req, res) => {
    try {
        const { name, password } = req.body;
        
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const tenantConnection = getTenantConnection(tenant.dbName);
        const User = tenantConnection.model('User');

        const userToUpdate = await User.findById(req.params.userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found in tenant database' });
        }

        if (name) userToUpdate.name = name;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        await userToUpdate.save();

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

module.exports = router;
