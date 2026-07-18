const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/inventory/categoryController');
const productController = require('../controllers/inventory/productController');
const warehouseController = require('../controllers/inventory/warehouseController');
const supplierController = require('../controllers/inventory/supplierController');
const stockController = require('../controllers/inventory/stockController');

// ----------------------------------------
// Categories Routes
// ----------------------------------------
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);

// ----------------------------------------
// Products Routes
// ----------------------------------------
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// ----------------------------------------
// Warehouses Routes
// ----------------------------------------
router.get('/warehouses', warehouseController.getWarehouses);
router.post('/warehouses', warehouseController.createWarehouse);

// ----------------------------------------
// Suppliers Routes
// ----------------------------------------
router.get('/suppliers', supplierController.getSuppliers);
router.post('/suppliers', supplierController.createSupplier);

// ----------------------------------------
// Stock Movements Routes
// ----------------------------------------
router.get('/movements', stockController.getMovements);
router.post('/movements/add', stockController.addStock);
router.post('/movements/remove', stockController.removeStock);

// ----------------------------------------
// WMS Routes
// ----------------------------------------
router.get('/low-stock', productController.getLowStock);

module.exports = router;
