const express = require('express');
const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
});

// Create a supplier
router.post('/', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: 'Error creating supplier', error: error.message });
    }
});

// Update a supplier
router.put('/:id', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSupplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(updatedSupplier);
    } catch (error) {
        res.status(400).json({ message: 'Error updating supplier', error: error.message });
    }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!deletedSupplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting supplier', error: error.message });
    }
});

// Pay Supplier Balance
router.post('/:id/pay', async (req, res) => {
    try {
        const Supplier = req.tenantConnection.model('Supplier');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');
        
        const { amount, paymentMethod, notes } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        // Update Balance
        supplier.balanceDue -= amount;
        await supplier.save();

        // Double-Entry Accounting: Debit Accounts Payable, Credit Cash
        const accAP = await Account.findOne({ code: '2000' });
        const accCash = await Account.findOne({ code: '1000' });

        if (accAP && accCash) {
            const entryCount = await JournalEntry.countDocuments();
            await JournalEntry.create({
                entryNumber: `JE-${Date.now()}-${entryCount + 1}`,
                description: `Supplier Payment: ${supplier.name} - ${notes || 'Manual'}`,
                lines: [
                    { accountId: accAP._id, debit: amount, credit: 0 },
                    { accountId: accCash._id, debit: 0, credit: amount }
                ]
            });
            await Account.findByIdAndUpdate(accAP._id, { $inc: { balance: -amount } }); // Liability decreases with Debit
            await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: -amount } }); // Asset decreases with Credit
        }

        res.json(supplier);
    } catch (error) {
        res.status(400).json({ message: 'Error processing supplier payment', error: error.message });
    }
});

module.exports = router;
