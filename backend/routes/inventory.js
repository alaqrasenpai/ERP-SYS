const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const router = express.Router();

const categoryController = require('../controllers/inventory/categoryController');
const productController = require('../controllers/inventory/productController');
const warehouseController = require('../controllers/inventory/warehouseController');
const supplierController = require('../controllers/inventory/supplierController');
const stockController = require('../controllers/inventory/stockController');
const dashboardController = require('../controllers/inventory/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', requirePermission('inventory:read'), dashboardController.getDashboardStats);

// ----------------------------------------
// Categories Routes
// ----------------------------------------
router.get('/categories', requirePermission('inventory:read'), categoryController.getCategories);
router.post('/categories', requirePermission('inventory:manage'), categoryController.createCategory);

// ----------------------------------------
// Products Routes
// ----------------------------------------
router.get('/products', requirePermission('inventory:read'), productController.getProducts);
router.post('/products', requirePermission('inventory:manage'), productController.createProduct);
router.put('/products/:id', requirePermission('inventory:manage'), productController.updateProduct);
router.delete('/products/:id', requirePermission('inventory:manage'), productController.deleteProduct);

// ----------------------------------------
// Warehouses Routes
// ----------------------------------------
router.get('/warehouses', requirePermission('inventory:read'), warehouseController.getWarehouses);
router.post('/warehouses', requirePermission('inventory:manage'), warehouseController.createWarehouse);

// ----------------------------------------
// Suppliers Routes
// ----------------------------------------
router.get('/suppliers', requirePermission('inventory:read'), supplierController.getSuppliers);
router.post('/suppliers', requirePermission('inventory:manage'), supplierController.createSupplier);

// ----------------------------------------
// Stock Movements Routes
// ----------------------------------------
router.get('/movements', requirePermission('inventory:read'), stockController.getMovements);
router.post('/movements/add', requirePermission('inventory:manage'), stockController.addStock);
router.post('/movements/remove', requirePermission('inventory:manage'), stockController.removeStock);

// ----------------------------------------
// WMS Routes
// ----------------------------------------
router.get('/low-stock', requirePermission('inventory:read'), productController.getLowStock);

module.exports = router;
