const { getModels } = require('./utils');

exports.getOrders = async (req, res) => {
    try {
        const { RestaurantOrder } = getModels(req);
        const orders = await RestaurantOrder.find({
            status: { $ne: 'Cancelled' },
            $or: [
                { status: 'Open' },
                { 'items.kitchenStatus': { $ne: 'Served' } }
            ]
        })
            .populate('tableId')
            .populate('deliveryDetails.providerId');
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createOrder = async (req, res) => {
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
    } catch (err) { 
        console.error('Create Order Error:', err);
        res.status(500).json({ error: err.message }); 
    }
};

exports.updateKitchenStatus = async (req, res) => {
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
};

exports.checkout = async (req, res) => {
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

        // Deduct Aggregator Commission
        if (order.orderType === 'Delivery' && order.deliveryDetails?.providerId) {
            await DeliveryProvider.findByIdAndUpdate(order.deliveryDetails.providerId, {
                $inc: { accountBalance: order.financials.netRestaurantRevenue }
            });
        }

        // Deduct Inventory
        let totalCogs = 0;
        for (const item of order.items) {
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
};

exports.getCompletedOrders = async (req, res) => {
    try {
        const { RestaurantOrder } = getModels(req);
        const { date } = req.query;
        
        const filterDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));

        const orders = await RestaurantOrder.find({
            status: 'Paid',
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
