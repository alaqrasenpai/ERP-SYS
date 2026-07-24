const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const tenantResolver = require('../middlewares/tenantResolver');

router.get('/menu', tenantResolver, publicController.getPublicMenu);
router.get('/tenant/:tenantId', publicController.getTenantInfo);

module.exports = router;
