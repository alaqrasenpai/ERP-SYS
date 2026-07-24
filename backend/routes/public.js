const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/menu', publicController.getPublicMenu);
router.get('/tenant/:tenantId', publicController.getTenantInfo);

module.exports = router;
