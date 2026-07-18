const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Helper to get models
const getModels = (req) => {
    return {
        DeliveryProvider: req.tenantConnection.model('DeliveryProvider'),
        RestaurantTable: req.tenantConnection.model('RestaurantTable'),
        MenuItem: req.tenantConnection.model('MenuItem'),
        RestaurantOrder: req.tenantConnection.model('RestaurantOrder'),
        MenuCategory: req.tenantConnection.model('MenuCategory'),
        Product: req.tenantConnection.model('Product'),
        Account: req.tenantConnection.model('Account'),
        JournalEntry: req.tenantConnection.model('JournalEntry')
    };
};

// --- Tables CRUD ---
router.get('/tables', async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        const tables = await RestaurantTable.find().populate('currentOrderId');
        res.json(tables);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tables', async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        const table = await RestaurantTable.create(req.body);
        res.json(table);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Menu Categories CRUD ---
router.get('/categories', async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const categories = await MenuCategory.find();
        res.json(categories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const cat = await MenuCategory.create(req.body);
        res.json(cat);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const cat = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(cat);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Menu Items CRUD ---
router.get('/menu', async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const menu = await MenuItem.find().populate('ingredients.productId');
        res.json(menu);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/menu', async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const item = await MenuItem.create(req.body);
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/menu/:id', async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Delivery Providers CRUD ---
router.get('/providers', async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const provs = await DeliveryProvider.find();
        res.json(provs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/providers', async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const prov = await DeliveryProvider.create(req.body);
        res.json(prov);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/providers/:id', async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const prov = await DeliveryProvider.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(prov);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Orders ---
router.get('/orders', async (req, res) => {
    try {
        const { RestaurantOrder } = getModels(req);
        const orders = await RestaurantOrder.find({ status: { $ne: 'Paid' } })
            .populate('tableId')
            .populate('deliveryDetails.providerId');
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/orders', async (req, res) => {
    try {
        const { RestaurantOrder, RestaurantTable, DeliveryProvider } = getModels(req);
        const { orderType, tableId, items, deliveryDetails } = req.body;
        
        let subTotal = 0;
        if (items && items.length > 0) {
            subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        const tax = subTotal * 0.15; // 15% VAT assumption
        let grandTotal = subTotal + tax;
        let aggregatorCommission = 0;
        let netRestaurantRevenue = grandTotal;

        if (orderType === 'Delivery' && deliveryDetails?.providerId) {
            const provider = await DeliveryProvider.findById(deliveryDetails.providerId);
            if (provider) {
                aggregatorCommission = grandTotal * (provider.commissionRate / 100);
                netRestaurantRevenue = grandTotal - aggregatorCommission;
                deliveryDetails.providerName = provider.nameEn;
            }
        }

        const newOrder = await RestaurantOrder.create({
            orderType,
            tableId,
            items,
            deliveryDetails,
            financials: { subTotal, tax, aggregatorCommission, grandTotal, netRestaurantRevenue }
        });

        if (orderType === 'Dine-In' && tableId) {
            await RestaurantTable.findByIdAndUpdate(tableId, { 
                status: 'Occupied', 
                currentOrderId: newOrder._id 
            });
        }

        res.json(newOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update Kitchen Status
router.put('/orders/:id/kitchen-status', async (req, res) => {
    try {
        const { RestaurantOrder } = getModels(req);
        const { itemId, status } = req.body; 
        const order = await RestaurantOrder.findOneAndUpdate(
            { _id: req.params.id, "items._id": itemId },
            { $set: { "items.$.kitchenStatus": status } },
            { new: true }
        );
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Checkout
router.post('/orders/:id/checkout', async (req, res) => {
    try {
        const { RestaurantOrder, RestaurantTable, DeliveryProvider, Product, Account, JournalEntry } = getModels(req);
        const { paymentMethod } = req.body; 
        
        const order = await RestaurantOrder.findById(req.params.id).populate('items.menuItemId');
        if (!order || order.status === 'Paid') return res.status(400).json({ message: 'Invalid order' });

        order.status = 'Paid';
        order.paymentMethod = paymentMethod;
        await order.save();

        // Release Table
        if (order.orderType === 'Dine-In' && order.tableId) {
            await RestaurantTable.findByIdAndUpdate(order.tableId, { status: 'Available', currentOrderId: null });
        }

        // Deduct Aggregator Commission from their Balance
        if (order.orderType === 'Delivery' && order.deliveryDetails?.providerId) {
            await DeliveryProvider.findByIdAndUpdate(order.deliveryDetails.providerId, {
                $inc: { accountBalance: order.financials.netRestaurantRevenue }
            });
        }

        // Deduct Inventory (WMS Integration)
        let totalCogs = 0;
        for (const item of order.items) {
            // Need to fetch MenuItem to get ingredients if not fully populated
            const menuItem = item.menuItemId;
            if (menuItem && menuItem.ingredients) {
                for (const ing of menuItem.ingredients) {
                    const product = await Product.findById(ing.productId);
                    if (product) {
                        const qtyToDeduct = ing.quantityUsed * item.quantity;
                        product.stockQuantity -= qtyToDeduct;
                        await product.save();
                        totalCogs += (product.purchasePrice * qtyToDeduct);
                    }
                }
            }
        }

        // Automated Double Entry Accounting
        const defaults = [
            { code: '1000', name: 'Cash/Bank', type: 'Asset' },
            { code: '1250', name: 'Aggregator Receivables', type: 'Asset' },
            { code: '1300', name: 'Inventory', type: 'Asset' },
            { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
            { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' }
        ];
        for (const def of defaults) {
            await Account.findOneAndUpdate({ code: def.code }, { $setOnInsert: def }, { upsert: true });
        }

        const accCash = await Account.findOne({ code: '1000' });
        const accAggR = await Account.findOne({ code: '1250' });
        const accInv = await Account.findOne({ code: '1300' });
        const accRev = await Account.findOne({ code: '4000' });
        const accCogs = await Account.findOne({ code: '5000' });

        const jeCount = await JournalEntry.countDocuments();
        let jeLines = [];

        // Revenue Credit
        jeLines.push({ accountId: accRev._id, debit: 0, credit: order.financials.grandTotal });
        await Account.findByIdAndUpdate(accRev._id, { $inc: { balance: order.financials.grandTotal } });

        if (paymentMethod === 'Aggregator Credit') {
            jeLines.push({ accountId: accAggR._id, debit: order.financials.netRestaurantRevenue, credit: 0 });
            await Account.findByIdAndUpdate(accAggR._id, { $inc: { balance: order.financials.netRestaurantRevenue } });
            
            let accComm = await Account.findOne({ code: '5100' });
            if (!accComm) accComm = await Account.create({ code: '5100', name: 'Delivery Commissions', type: 'Expense' });
            
            jeLines.push({ accountId: accComm._id, debit: order.financials.aggregatorCommission, credit: 0 });
            await Account.findByIdAndUpdate(accComm._id, { $inc: { balance: order.financials.aggregatorCommission } });

        } else {
            jeLines.push({ accountId: accCash._id, debit: order.financials.grandTotal, credit: 0 });
            await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: order.financials.grandTotal } });
        }

        // COGS & Inventory
        if (totalCogs > 0) {
            jeLines.push({ accountId: accCogs._id, debit: totalCogs, credit: 0 });
            await Account.findByIdAndUpdate(accCogs._id, { $inc: { balance: totalCogs } });

            jeLines.push({ accountId: accInv._id, debit: 0, credit: totalCogs });
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: -totalCogs } });
        }

        await JournalEntry.create({
            entryNumber: `JE-${(jeCount + 1).toString().padStart(5, '0')}`,
            date: new Date(),
            description: `Restaurant Order #${order.orderNumber}`,
            lines: jeLines,
            totalDebit: order.financials.grandTotal + totalCogs,
            totalCredit: order.financials.grandTotal + totalCogs
        });

        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
