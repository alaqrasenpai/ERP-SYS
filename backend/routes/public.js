const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/menu', publicController.getPublicMenu);

module.exports = router;
