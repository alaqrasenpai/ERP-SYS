const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// GET all users
router.get('/', async (req, res) => {
    try {
        const User = req.tenantConnection.model('User');
        const users = await User.find().populate('role', 'name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// POST a new user
router.post('/', async (req, res) => {
    try {
        const User = req.tenantConnection.model('User');
        const Role = req.tenantConnection.model('Role');
        
        const { name, email, password, roleName } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Find or create role
        let role = await Role.findOne({ name: roleName || 'User' });
        if (!role) {
            role = await Role.create({ name: roleName || 'User', permissions: [] });
        }

        // Check if user exists
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role._id
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
});
// PUT to update a user
router.put('/:id', async (req, res) => {
    try {
        const User = req.tenantConnection.model('User');
        const Role = req.tenantConnection.model('Role');
        
        const { name, email, password, roleName, isActive } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already exists' });
            user.email = email;
        }
        if (password) {
            user.password = password; // Pre-save hook will hash it if modified
        }
        if (roleName) {
            let role = await Role.findOne({ name: roleName });
            if (!role) {
                role = await Role.create({ name: roleName, permissions: [] });
            }
            user.role = role._id;
        }
        if (isActive !== undefined) {
            user.isActive = isActive;
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

module.exports = router;
