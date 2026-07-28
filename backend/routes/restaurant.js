const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const router = express.Router();

const tableController = require('../controllers/restaurant/tableController');
const categoryController = require('../controllers/restaurant/categoryController');
const menuController = require('../controllers/restaurant/menuController');
const providerController = require('../controllers/restaurant/providerController');
const orderController = require('../controllers/restaurant/orderController');

const sectionController = require('../controllers/restaurant/sectionController');

// --- Tables CRUD ---
router.get('/tables', requirePermission('restaurant:use'), tableController.getTables);
router.post('/tables', requirePermission('restaurant:manage'), tableController.createTable);
router.put('/tables/:id', requirePermission('restaurant:manage'), tableController.updateTable);
router.delete('/tables/:id', requirePermission('restaurant:manage'), tableController.deleteTable);

// --- Table Sections CRUD ---
router.get('/sections', requirePermission('restaurant:use'), sectionController.getSections);
router.post('/sections', requirePermission('restaurant:manage'), sectionController.createSection);
router.put('/sections/:id', requirePermission('restaurant:manage'), sectionController.updateSection);
router.delete('/sections/:id', requirePermission('restaurant:manage'), sectionController.deleteSection);

// --- Menu Categories CRUD ---
router.get('/categories', requirePermission('restaurant:use'), categoryController.getCategories);
router.post('/categories', requirePermission('restaurant:manage'), categoryController.createCategory);
router.put('/categories/:id', requirePermission('restaurant:manage'), categoryController.updateCategory);

// --- Menu Items CRUD ---
router.get('/menu', requirePermission('restaurant:use'), menuController.getMenu);
router.post('/menu', requirePermission('restaurant:manage'), menuController.createMenuItem);
router.put('/menu/:id', requirePermission('restaurant:manage'), menuController.updateMenuItem);

// --- Delivery Providers CRUD ---
router.get('/providers', requirePermission('restaurant:use'), providerController.getProviders);
router.post('/providers', requirePermission('restaurant:manage'), providerController.createProvider);
router.put('/providers/:id', requirePermission('restaurant:manage'), providerController.updateProvider);

// --- Orders ---
router.get('/orders/completed', requirePermission('restaurant:use'), orderController.getCompletedOrders);
router.get('/orders', requirePermission('restaurant:use'), orderController.getOrders);
router.post('/orders', requirePermission('restaurant:manage'), orderController.createOrder);
router.put('/orders/:id/kitchen-status', requirePermission('restaurant:manage'), orderController.updateKitchenStatus);
router.post('/orders/:id/checkout', requirePermission('restaurant:manage'), orderController.checkout);

module.exports = router;
