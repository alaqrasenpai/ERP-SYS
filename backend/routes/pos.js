const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const readPerm = requirePermission('pos:use');
const managePerm = requirePermission('pos:manage');
const router = express.Router();

const orderController = require('../controllers/pos/orderController');
const shiftController = require('../controllers/pos/shiftController');
const dashboardController = require('../controllers/pos/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', readPerm, dashboardController.getDashboardStats);

// ----------------------------------------
// POS Orders Routes
// ----------------------------------------
router.get('/orders', readPerm, orderController.getOrders);
router.post('/orders', managePerm, orderController.createOrder);

// ----------------------------------------
// Shifts Routes
// ----------------------------------------
router.get('/shifts', readPerm, shiftController.getShifts);
router.get('/shifts/current', readPerm, shiftController.getCurrentShift);
router.post('/shifts/open', managePerm, shiftController.openShift);
router.post('/shifts/close/:id', managePerm, shiftController.closeShift);

module.exports = router;
