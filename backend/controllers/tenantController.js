const Tenant = require('../models/Tenant');

// @desc    Create a new tenant
// @route   POST /api/tenants
// @access  Private (Superadmin)
const createTenant = async (req, res) => {
    const { name, domain, dbName } = req.body;

    try {
        const tenantExists = await Tenant.findOne({ $or: [{ domain }, { dbName }] });

        if (tenantExists) {
            return res.status(400).json({ message: 'Tenant with this domain or dbName already exists' });
        }

        const tenant = await Tenant.create({
            name,
            domain,
            dbName
        });

        res.status(201).json({
            _id: tenant._id,
            name: tenant.name,
            domain: tenant.domain,
            dbName: tenant.dbName
        });
    } catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Superadmin)
const getTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find({});
        res.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createTenant, getTenants };
