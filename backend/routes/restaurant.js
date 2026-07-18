const express = require('express');
const router = express.Router();

const tableController = require('../controllers/restaurant/tableController');
const categoryController = require('../controllers/restaurant/categoryController');
const menuController = require('../controllers/restaurant/menuController');
const providerController = require('../controllers/restaurant/providerController');
const orderController = require('../controllers/restaurant/orderController');

const sectionController = require('../controllers/restaurant/sectionController');

// --- Tables CRUD ---
router.get('/tables', tableController.getTables);
router.post('/tables', tableController.createTable);
router.put('/tables/:id', tableController.updateTable);
router.delete('/tables/:id', tableController.deleteTable);

// --- Table Sections CRUD ---
router.get('/sections', sectionController.getSections);
router.post('/sections', sectionController.createSection);
router.put('/sections/:id', sectionController.updateSection);
router.delete('/sections/:id', sectionController.deleteSection);

// --- Menu Categories CRUD ---
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);

// --- Menu Items CRUD ---
router.get('/menu', menuController.getMenu);
router.post('/menu', menuController.createMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);

// --- Delivery Providers CRUD ---
router.get('/providers', providerController.getProviders);
router.post('/providers', providerController.createProvider);
router.put('/providers/:id', providerController.updateProvider);

// --- Orders ---
router.get('/orders/completed', orderController.getCompletedOrders);
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/kitchen-status', orderController.updateKitchenStatus);
router.post('/orders/:id/checkout', orderController.checkout);

module.exports = router;
