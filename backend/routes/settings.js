const express = require('express');
const router = express.Router();

// GET /api/settings - Fetch global settings
router.get('/', async (req, res) => {
    try {
        const Setting = req.tenantConnection.model('Setting');
        let settings = await Setting.findOne();
        
        // Singleton pattern: Create default if it doesn't exist
        if (!settings) {
            settings = await Setting.create({});
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});

// PUT /api/settings - Update global settings
router.put('/', async (req, res) => {
    try {
        const Setting = req.tenantConnection.model('Setting');
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findOneAndUpdate({}, req.body, { new: true });
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
});

module.exports = router;
