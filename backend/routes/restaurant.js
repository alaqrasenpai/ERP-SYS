const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const readPerm = requirePermission('pos:use');
const managePerm = requirePermission('pos:manage');
const router = express.Router();

const tableController = require('../controllers/restaurant/tableController');
const categoryController = require('../controllers/restaurant/categoryController');
const menuController = require('../controllers/restaurant/menuController');
const providerController = require('../controllers/restaurant/providerController');
const orderController = require('../controllers/restaurant/orderController');

const sectionController = require('../controllers/restaurant/sectionController');

// --- Tables CRUD ---
router.get('/tables', readPerm, tableController.getTables);
router.post('/tables', managePerm, tableController.createTable);
router.put('/tables/:id', managePerm, tableController.updateTable);
router.delete('/tables/:id', managePerm, tableController.deleteTable);

// --- Table Sections CRUD ---
router.get('/sections', readPerm, sectionController.getSections);
router.post('/sections', managePerm, sectionController.createSection);
router.put('/sections/:id', managePerm, sectionController.updateSection);
router.delete('/sections/:id', managePerm, sectionController.deleteSection);

// --- Menu Categories CRUD ---
router.get('/categories', readPerm, categoryController.getCategories);
router.post('/categories', managePerm, categoryController.createCategory);
router.put('/categories/:id', managePerm, categoryController.updateCategory);

// --- Menu Items CRUD ---
router.get('/menu', readPerm, menuController.getMenu);
router.post('/menu', managePerm, menuController.createMenuItem);
router.put('/menu/:id', managePerm, menuController.updateMenuItem);

// --- Delivery Providers CRUD ---
router.get('/providers', readPerm, providerController.getProviders);
router.post('/providers', managePerm, providerController.createProvider);
router.put('/providers/:id', managePerm, providerController.updateProvider);

// --- Orders ---
router.get('/orders/completed', readPerm, orderController.getCompletedOrders);
router.get('/orders', readPerm, orderController.getOrders);
router.post('/orders', managePerm, orderController.createOrder);
router.put('/orders/:id/kitchen-status', managePerm, orderController.updateKitchenStatus);
router.post('/orders/:id/checkout', managePerm, orderController.checkout);

module.exports = router;
