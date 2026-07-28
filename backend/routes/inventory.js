const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const readPerm = requirePermission('inventory:read');
const managePerm = requirePermission('inventory:manage');
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
router.get('/dashboard', readPerm, dashboardController.getDashboardStats);

// ----------------------------------------
// Categories Routes
// ----------------------------------------
router.get('/categories', readPerm, categoryController.getCategories);
router.post('/categories', managePerm, categoryController.createCategory);

// ----------------------------------------
// Products Routes
// ----------------------------------------
router.get('/products', readPerm, productController.getProducts);
router.post('/products', managePerm, productController.createProduct);
router.put('/products/:id', managePerm, productController.updateProduct);
router.delete('/products/:id', managePerm, productController.deleteProduct);

// ----------------------------------------
// Warehouses Routes
// ----------------------------------------
router.get('/warehouses', readPerm, warehouseController.getWarehouses);
router.post('/warehouses', managePerm, warehouseController.createWarehouse);

// ----------------------------------------
// Suppliers Routes
// ----------------------------------------
router.get('/suppliers', readPerm, supplierController.getSuppliers);
router.post('/suppliers', managePerm, supplierController.createSupplier);

// ----------------------------------------
// Stock Movements Routes
// ----------------------------------------
router.get('/movements', readPerm, stockController.getMovements);
router.post('/movements/add', managePerm, stockController.addStock);
router.post('/movements/remove', managePerm, stockController.removeStock);

// ----------------------------------------
// WMS Routes
// ----------------------------------------
router.get('/low-stock', readPerm, productController.getLowStock);

module.exports = router;
