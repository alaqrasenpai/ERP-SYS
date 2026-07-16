const express = require('express');
const router = express.Router();

// ----------------------------------------
// Categories Routes
// ----------------------------------------
router.get('/categories', async (req, res) => {
    try {
        const Category = req.tenantConnection.model('Category');
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const Category = req.tenantConnection.model('Category');
        const newCategory = await Category.create(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
});

// ----------------------------------------
// Products Routes
// ----------------------------------------
router.get('/products', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        const products = await Product.find().populate('supplier warehouseId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error: error.message });
    }
});

// ----------------------------------------
// Warehouses Routes
// ----------------------------------------
router.get('/warehouses', async (req, res) => {
    try {
        const Warehouse = req.tenantConnection.model('Warehouse');
        const warehouses = await Warehouse.find();
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching warehouses', error: error.message });
    }
});

router.post('/warehouses', async (req, res) => {
    try {
        const Warehouse = req.tenantConnection.model('Warehouse');
        const newWarehouse = await Warehouse.create(req.body);
        res.status(201).json(newWarehouse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating warehouse', error: error.message });
    }
});

// ----------------------------------------
// Suppliers Routes
// ----------------------------------------
router.get('/suppliers', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
});

router.post('/suppliers', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: 'Error creating supplier', error: error.message });
    }
});

// ----------------------------------------
// Stock Movements Routes
// ----------------------------------------
router.get('/movements', async (req, res) => {
    try {
        const StockMovement = req.tenantConnection.model('StockMovement');
        const movements = await StockMovement.find()
            .populate('productId', 'name sku')
            .populate('supplierId', 'name')
            .populate('performedBy', 'name email')
            .sort({ date: -1 });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock movements', error: error.message });
    }
});

router.post('/movements/add', async (req, res) => {
    try {
        const StockMovement = req.tenantConnection.model('StockMovement');
        const Product = req.tenantConnection.model('Product');
        const Supplier = req.tenantConnection.model('Supplier');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');

        const { productId, quantity, unitCost, supplierId, referenceNumber, paymentMethod } = req.body;
        
        if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const totalCost = quantity * (unitCost || product.purchasePrice || 0);

        // Update Product
        product.stockQuantity += quantity;
        if (unitCost > 0) {
            product.purchasePrice = unitCost; // Update unit cost
        }
        await product.save();

        // Create Movement
        const movement = await StockMovement.create({
            productId,
            type: 'in',
            quantity,
            unitCost: unitCost || product.purchasePrice,
            totalCost,
            supplierId,
            referenceNumber,
            reason: 'Purchase Order / Restock',
            performedBy: req.user?._id
        });

        // Accounting Logic
        const accInv = await Account.findOne({ code: '1300' }); // Inventory
        const accAP = await Account.findOne({ code: '2000' }); // Accounts Payable
        const accCash = await Account.findOne({ code: '1000' }); // Cash

        if (supplierId && paymentMethod === 'Credit') {
            const supplier = await Supplier.findById(supplierId);
            if (supplier) {
                supplier.balanceDue += totalCost;
                await supplier.save();
            }
            if (accInv && accAP) {
                const jeCount = await JournalEntry.countDocuments();
                await JournalEntry.create({
                    entryNumber: `JE-${Date.now()}-${jeCount + 1}`,
                    description: `Inventory Purchase from Supplier (Credit) - Ref: ${referenceNumber || 'N/A'}`,
                    lines: [
                        { accountId: accInv._id, debit: totalCost, credit: 0 },
                        { accountId: accAP._id, debit: 0, credit: totalCost }
                    ]
                });
                await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: totalCost } }); // Asset inc
                await Account.findByIdAndUpdate(accAP._id, { $inc: { balance: totalCost } }); // Liab inc
            }
        } else if (paymentMethod === 'Cash' && accInv && accCash) {
            const jeCount = await JournalEntry.countDocuments();
            await JournalEntry.create({
                entryNumber: `JE-${Date.now()}-${jeCount + 1}`,
                description: `Inventory Purchase (Cash) - Ref: ${referenceNumber || 'N/A'}`,
                lines: [
                    { accountId: accInv._id, debit: totalCost, credit: 0 },
                    { accountId: accCash._id, debit: 0, credit: totalCost }
                ]
            });
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: totalCost } }); // Asset inc
            await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: -totalCost } }); // Asset dec
        }

        res.status(201).json({ message: 'Stock added successfully', movement });
    } catch (error) {
        res.status(400).json({ message: 'Error adding stock', error: error.message });
    }
});

router.post('/movements/remove', async (req, res) => {
    try {
        const StockMovement = req.tenantConnection.model('StockMovement');
        const Product = req.tenantConnection.model('Product');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');

        const { productId, quantity, reason } = req.body;
        
        if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
        if (!reason) return res.status(400).json({ message: 'A reason must be provided for stock adjustments' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stockQuantity < quantity) return res.status(400).json({ message: 'Insufficient stock to remove' });

        const unitCost = product.purchasePrice || 0;
        const totalCost = unitCost * quantity;

        // Update Product
        product.stockQuantity -= quantity;
        await product.save();

        // Create Movement
        const movement = await StockMovement.create({
            productId,
            type: 'adjustment',
            quantity,
            unitCost,
            totalCost,
            reason,
            performedBy: req.user?._id
        });

        // Accounting Logic
        // Ensure Shrinkage account exists
        let accShrink = await Account.findOne({ code: '5100' });
        if (!accShrink) {
            accShrink = await Account.create({ code: '5100', name: 'Inventory Shrinkage & Loss', type: 'Expense' });
        }
        const accInv = await Account.findOne({ code: '1300' }); // Inventory

        if (accInv && accShrink && totalCost > 0) {
            const jeCount = await JournalEntry.countDocuments();
            await JournalEntry.create({
                entryNumber: `JE-${Date.now()}-${jeCount + 1}`,
                description: `Inventory Adjustment / Loss: ${reason}`,
                lines: [
                    { accountId: accShrink._id, debit: totalCost, credit: 0 },
                    { accountId: accInv._id, debit: 0, credit: totalCost }
                ]
            });
            await Account.findByIdAndUpdate(accShrink._id, { $inc: { balance: totalCost } }); // Exp inc
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: -totalCost } }); // Asset dec
        }

        res.status(201).json({ message: 'Stock removed successfully', movement });
    } catch (error) {
        res.status(400).json({ message: 'Error removing stock', error: error.message });
    }
});

// ----------------------------------------
// WMS Routes
// ----------------------------------------
router.get('/low-stock', async (req, res) => {
    try {
        const Product = req.tenantConnection.model('Product');
        // Find products where stock is <= alertQuantity (by using $expr to compare fields)
        const products = await Product.find({ $expr: { $lte: ['$stockQuantity', '$alertQuantity'] } }).populate('supplier warehouseId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
    }
});



module.exports = router;
