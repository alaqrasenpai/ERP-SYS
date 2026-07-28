const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const router = express.Router();

const orderController = require('../controllers/pos/orderController');
const shiftController = require('../controllers/pos/shiftController');
const dashboardController = require('../controllers/pos/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', requirePermission('store_pos:use'), dashboardController.getDashboardStats);

// ----------------------------------------
// POS Orders Routes
// ----------------------------------------
router.get('/orders', requirePermission('store_pos:use'), orderController.getOrders);
router.post('/orders', requirePermission('store_pos:manage'), orderController.createOrder);

// ----------------------------------------
// Shifts Routes
// ----------------------------------------
router.get('/shifts', requirePermission('store_pos:use'), shiftController.getShifts);
router.get('/shifts/current', requirePermission('store_pos:use'), shiftController.getCurrentShift);
router.post('/shifts/open', requirePermission('store_pos:manage'), shiftController.openShift);
router.post('/shifts/close/:id', requirePermission('store_pos:manage'), shiftController.closeShift);

module.exports = router;
