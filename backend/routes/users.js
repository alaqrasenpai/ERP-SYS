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

module.exports = router;
