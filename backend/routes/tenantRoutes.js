const express = require('express');
const router = express.Router();
const { createTenant, getTenants } = require('../controllers/tenantController');

// In a real application, these routes should be protected with superadmin authentication
router.post('/', createTenant);
router.get('/', getTenants);

module.exports = router;
