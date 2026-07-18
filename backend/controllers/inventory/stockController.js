const { getModels } = require('./utils');

exports.getMovements = async (req, res) => {
    try {
        const { StockMovement } = getModels(req);
        const movements = await StockMovement.find()
            .populate('productId', 'name sku')
            .populate('supplierId', 'name')
            .populate('performedBy', 'name email')
            .sort({ date: -1 });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock movements', error: error.message });
    }
};

exports.addStock = async (req, res) => {
    try {
        const { StockMovement, Product, Supplier, Account, JournalEntry } = getModels(req);

        const { productId, quantity, unitCost, supplierId, referenceNumber, paymentMethod } = req.body;
        
        if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const totalCost = quantity * (unitCost || product.purchasePrice || 0);

        product.stockQuantity += quantity;
        if (unitCost > 0) {
            product.purchasePrice = unitCost; 
        }
        await product.save();

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

        const accInv = await Account.findOne({ code: '1300' }); 
        const accAP = await Account.findOne({ code: '2000' }); 
        const accCash = await Account.findOne({ code: '1000' }); 

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
                await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: totalCost } }); 
                await Account.findByIdAndUpdate(accAP._id, { $inc: { balance: totalCost } }); 
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
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: totalCost } }); 
            await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: -totalCost } }); 
        }

        res.status(201).json({ message: 'Stock added successfully', movement });
    } catch (error) {
        res.status(400).json({ message: 'Error adding stock', error: error.message });
    }
};

exports.removeStock = async (req, res) => {
    try {
        const { StockMovement, Product, Account, JournalEntry } = getModels(req);

        const { productId, quantity, reason } = req.body;
        
        if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
        if (!reason) return res.status(400).json({ message: 'A reason must be provided for stock adjustments' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stockQuantity < quantity) return res.status(400).json({ message: 'Insufficient stock to remove' });

        const unitCost = product.purchasePrice || 0;
        const totalCost = unitCost * quantity;

        product.stockQuantity -= quantity;
        await product.save();

        const movement = await StockMovement.create({
            productId,
            type: 'adjustment',
            quantity,
            unitCost,
            totalCost,
            reason,
            performedBy: req.user?._id
        });

        let accShrink = await Account.findOne({ code: '5100' });
        if (!accShrink) {
            accShrink = await Account.create({ code: '5100', name: 'Inventory Shrinkage & Loss', type: 'Expense' });
        }
        const accInv = await Account.findOne({ code: '1300' }); 

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
            await Account.findByIdAndUpdate(accShrink._id, { $inc: { balance: totalCost } }); 
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: -totalCost } }); 
        }

        res.status(201).json({ message: 'Stock removed successfully', movement });
    } catch (error) {
        res.status(400).json({ message: 'Error removing stock', error: error.message });
    }
};
