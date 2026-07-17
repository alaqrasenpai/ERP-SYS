const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (userId, email, role, tenantId) => {
    return jwt.sign(
        { id: userId, email, role, tenantId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user inside a tenant database
// @route   POST /api/auth/register
// @access  Public / Private (Depending on setup)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const tenantConnection = req.tenantConnection;
        const tenantConfig = req.tenantConfig;

        // Extract tenant-specific models compiled on the tenant connection
        const User = tenantConnection.model('User');
        const Role = tenantConnection.model('Role');

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Check if user already exists within this tenant
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists in this tenant' });
        }

        // Auto-seed a default Admin role if no roles exist at all
        let role = await Role.findOne({ name: 'Admin' });
        if (!role) {
            role = await Role.create({
                name: 'Admin',
                permissions: ['*'] // Represents full permissions
            });
        }

        // Create the User
        const user = await User.create({
            name,
            email,
            password,
            role: role._id
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: {
                    name: role.name,
                    permissions: role.permissions
                }
            },
            enabledModules: tenantConfig.enabledModules,
            token: generateToken(user._id, user.email, role.name, tenantConfig.tenantId)
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error during user registration' });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const tenantConnection = req.tenantConnection;
        const tenantConfig = req.tenantConfig;

        const User = tenantConnection.model('User');

        // Check for user
        const user = await User.findOne({ email }).populate('role');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const roleData = user.role ? {
            name: user.role.name,
            permissions: user.role.permissions || []
        } : { name: 'No Role', permissions: [] };

        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: roleData
            },
            enabledModules: tenantConfig.enabledModules,
            token: generateToken(user._id, user.email, roleData.name, tenantConfig.tenantId)
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
