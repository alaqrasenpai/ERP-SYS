const express = require('express');
const router = express.Router();

const orderController = require('../controllers/pos/orderController');
const shiftController = require('../controllers/pos/shiftController');

// ----------------------------------------
// POS Orders Routes
// ----------------------------------------
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);

// ----------------------------------------
// Shifts Routes
// ----------------------------------------
router.get('/shifts', shiftController.getShifts);
router.get('/shifts/current', shiftController.getCurrentShift);
router.post('/shifts/open', shiftController.openShift);
router.post('/shifts/close/:id', shiftController.closeShift);

module.exports = router;
