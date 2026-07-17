const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { requirePermission } = require('../middlewares/rbacGuard');

// Require 'team:manage' permission for all team routes
router.use(requirePermission('team:manage'));

// -----------------------------------------------------
// Roles Management
// -----------------------------------------------------

// GET /api/team/roles
router.get('/roles', async (req, res) => {
    try {
        const Role = req.tenantConnection.model('Role');
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
});

// POST /api/team/roles
router.post('/roles', async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const Role = req.tenantConnection.model('Role');

        if (!name || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Name and permissions array are required' });
        }

        const role = await Role.create({ name, permissions });
        res.status(201).json({ message: 'Role created', role });
    } catch (error) {
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
});

// PUT /api/team/roles/:id
router.put('/roles/:id', async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const Role = req.tenantConnection.model('Role');

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { name, permissions },
            { new: true }
        );

        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json({ message: 'Role updated', role });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
});

// DELETE /api/team/roles/:id
router.delete('/roles/:id', async (req, res) => {
    try {
        const Role = req.tenantConnection.model('Role');
        const User = req.tenantConnection.model('User');

        // Check if role is in use
        const usersWithRole = await User.countDocuments({ role: req.params.id });
        if (usersWithRole > 0) {
            return res.status(400).json({ message: 'Cannot delete role assigned to active users' });
        }

        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
});

// -----------------------------------------------------
// Users Management
// -----------------------------------------------------

// GET /api/team/users
router.get('/users', async (req, res) => {
    try {
        const User = req.tenantConnection.model('User');
        const users = await User.find().select('-password').populate('role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// POST /api/team/users
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, roleId, isActive } = req.body;
        const User = req.tenantConnection.model('User');

        if (!name || !email || !password || !roleId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password, // Password hashed via User schema pre-save hook
            role: roleId,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ message: 'User created', user: { _id: user._id, name, email } });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// PUT /api/team/users/:id
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, password, roleId, isActive } = req.body;
        const User = req.tenantConnection.model('User');

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (roleId) user.role = roleId;
        if (isActive !== undefined) user.isActive = isActive;
        if (password) {
            user.password = password; // Will be hashed via pre-save hook
        }

        await user.save();
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// PUT /api/team/users/:id/status
router.put('/users/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        const User = req.tenantConnection.model('User');

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${isActive ? 'activated' : 'suspended'}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
});

module.exports = router;
