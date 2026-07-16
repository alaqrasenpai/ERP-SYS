const express = require('express');
const router = express.Router();

// ----------------------------------------
// POS Orders Routes
// ----------------------------------------
router.get('/orders', async (req, res) => {
    try {
        const Order = req.tenantConnection.model('Order');
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

router.post('/orders', async (req, res) => {
    try {
        const Order = req.tenantConnection.model('Order');
        const Product = req.tenantConnection.model('Product');
        const StockMovement = req.tenantConnection.model('StockMovement');
        const Employee = req.tenantConnection.model('Employee');
        const PayrollRun = req.tenantConnection.model('PayrollRun');
        const Folder = req.tenantConnection.model('Folder');
        const File = req.tenantConnection.model('File');
        const User = req.tenantConnection.model('User');
        const Customer = req.tenantConnection.model('Customer');
        const DebtLog = req.tenantConnection.model('DebtLog');
        const InstallmentPlan = req.tenantConnection.model('InstallmentPlan');
        const CheckPayment = req.tenantConnection.model('CheckPayment');
        const Account = req.tenantConnection.model('Account');
        const JournalEntry = req.tenantConnection.model('JournalEntry');
        
        const { items, subTotal, discount, tax, grandTotal, paymentMethod, customerId, checkDetails, installmentDetails } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (['Debt', 'Installment', 'Check'].includes(paymentMethod) && !customerId) {
            return res.status(400).json({ message: `Customer is required for ${paymentMethod} payments` });
        }

        // Generate Order Number
        const count = await Order.countDocuments();
        const orderNumber = `ORD-${Date.now()}-${count + 1}`;

        // Verify stock availability and calculate COGS (Cost of Goods Sold)
        let totalCOGS = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${product.stockQuantity}` });
            }
            totalCOGS += (product.purchasePrice || 0) * item.quantity;
        }

        // Create Order
        const newOrder = await Order.create({
            orderNumber,
            cashierId: req.user?.id, 
            items,
            subTotal,
            discount,
            tax,
            grandTotal,
            paymentMethod
        });

        // Deduct Stock and create StockMovement logs
        for (const item of items) {
            const updatedProduct = await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity }
            }, { new: true });

            await StockMovement.create({
                productId: item.productId,
                type: 'out',
                quantity: item.quantity,
                reference: `Sold via POS Invoice #${orderNumber}`
            });

            if (updatedProduct && updatedProduct.stockQuantity <= (updatedProduct.alertQuantity || 0)) {
                console.log(`[ALERT] Product ${updatedProduct.name} is low on stock (${updatedProduct.stockQuantity})`);
            }
        }

        // HR Integration - 1% Commission
        try {
            const user = await User.findById(req.user?.id);
            if (user && user.email) {
                const employee = await Employee.findOne({ email: user.email });
                if (employee) {
                    const commission = grandTotal * 0.01;
                    const month = new Date().toISOString().substring(0, 7);
                    await PayrollRun.findOneAndUpdate(
                        { employeeId: employee._id, month },
                        { 
                            $inc: { totalAllowances: commission, netSalary: commission },
                            $setOnInsert: { basicSalary: employee.basicSalary || 0, totalOvertimeHours: 0, totalOvertimePay: 0, deductions: 0 }
                        },
                        { new: true, upsert: true }
                    );
                }
            }
        } catch (hrError) {
            console.error('HR Integration Error:', hrError);
        }

        // Archive Integration
        try {
            let invoiceFolder = await Folder.findOne({ name: 'Invoices' });
            if (!invoiceFolder) {
                invoiceFolder = await Folder.create({ name: 'Invoices', description: 'Auto-generated POS invoices' });
            }
            const invoiceContent = `Invoice: ${orderNumber}\nDate: ${new Date().toLocaleString()}\nTotal: $${grandTotal.toFixed(2)}\nItems: ${items.map(i => i.name).join(', ')}`;
            const base64Content = Buffer.from(invoiceContent).toString('base64');
            const dataUri = `data:text/plain;base64,${base64Content}`;

            await File.create({
                fileName: `${orderNumber}.txt`,
                folderId: invoiceFolder._id,
                fileType: 'text/plain',
                size: Buffer.byteLength(invoiceContent, 'utf8'),
                uploadedBy: req.user?.id,
                fileUrl: dataUri
            });
        } catch (archiveError) {
            console.error('Archive Integration Error:', archiveError);
        }

        // ----------------------------------------
        // Finance & CRM Integration
        // ----------------------------------------
        
        let customer = null;
        if (customerId) {
            customer = await Customer.findById(customerId);
        }

        if (paymentMethod === 'Debt' && customer) {
            customer.totalDebt += grandTotal;
            await customer.save();
            await DebtLog.create({
                customerId,
                orderId: newOrder._id,
                type: 'charge',
                amount: grandTotal,
                paymentMethod: 'Debt',
                notes: `POS Debt Sale #${orderNumber}`
            });
        } 
        else if (paymentMethod === 'Check' && customer && checkDetails) {
            await CheckPayment.create({
                customerId,
                orderId: newOrder._id,
                checkNumber: checkDetails.checkNumber,
                bankName: checkDetails.bankName,
                amount: grandTotal,
                dueDate: checkDetails.dueDate
            });
        }
        else if (paymentMethod === 'Installment' && customer && installmentDetails) {
            const { downPayment, months } = installmentDetails;
            const remaining = grandTotal - downPayment;
            const monthlyAmount = remaining / months;
            
            let insts = [];
            let currentDate = new Date();
            for (let i = 1; i <= months; i++) {
                let dDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
                insts.push({
                    dueDate: dDate,
                    amount: monthlyAmount,
                    status: 'Pending'
                });
            }

            await InstallmentPlan.create({
                customerId,
                orderId: newOrder._id,
                totalAmount: grandTotal,
                remainingAmount: remaining,
                downPayment: downPayment,
                installments: insts
            });

            // Down payment is cash, remaining is debt
            customer.totalDebt += remaining;
            await customer.save();

            await DebtLog.create({
                customerId,
                orderId: newOrder._id,
                type: 'charge',
                amount: remaining,
                paymentMethod: 'Installment',
                notes: `Installment Plan for #${orderNumber}`
            });
        }

        // ----------------------------------------
        // Double-Entry Bookkeeping
        // ----------------------------------------
        
        // Ensure default accounts
        const defaults = [
            { code: '1000', name: 'Cash/Bank', type: 'Asset' },
            { code: '1100', name: 'Post-Dated Checks', type: 'Asset' },
            { code: '1200', name: 'Accounts Receivable', type: 'Asset' },
            { code: '1300', name: 'Inventory', type: 'Asset' },
            { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
            { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' }
        ];
        for (const def of defaults) {
            await Account.findOneAndUpdate({ code: def.code }, { $setOnInsert: def }, { upsert: true });
        }

        const accCash = await Account.findOne({ code: '1000' });
        const accCheck = await Account.findOne({ code: '1100' });
        const accAR = await Account.findOne({ code: '1200' });
        const accInv = await Account.findOne({ code: '1300' });
        const accRev = await Account.findOne({ code: '4000' });
        const accCogs = await Account.findOne({ code: '5000' });

        const jeCount = await JournalEntry.countDocuments();
        let jeLines = [];

        // 1. Credit Sales Revenue
        jeLines.push({ accountId: accRev._id, debit: 0, credit: grandTotal });
        await Account.findByIdAndUpdate(accRev._id, { $inc: { balance: grandTotal } }); // Revenue increases with Credit

        // 2. Debit Asset based on Payment Method
        if (paymentMethod === 'Cash' || paymentMethod === 'Card') {
            jeLines.push({ accountId: accCash._id, debit: grandTotal, credit: 0 });
            await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: grandTotal } });
        } else if (paymentMethod === 'Debt') {
            jeLines.push({ accountId: accAR._id, debit: grandTotal, credit: 0 });
            await Account.findByIdAndUpdate(accAR._id, { $inc: { balance: grandTotal } });
        } else if (paymentMethod === 'Check') {
            jeLines.push({ accountId: accCheck._id, debit: grandTotal, credit: 0 });
            await Account.findByIdAndUpdate(accCheck._id, { $inc: { balance: grandTotal } });
        } else if (paymentMethod === 'Installment') {
            const dp = installmentDetails ? installmentDetails.downPayment : 0;
            const remaining = grandTotal - dp;
            if (dp > 0) {
                jeLines.push({ accountId: accCash._id, debit: dp, credit: 0 });
                await Account.findByIdAndUpdate(accCash._id, { $inc: { balance: dp } });
            }
            jeLines.push({ accountId: accAR._id, debit: remaining, credit: 0 });
            await Account.findByIdAndUpdate(accAR._id, { $inc: { balance: remaining } });
        }

        // 3. COGS and Inventory (if purchasePrice was set)
        if (totalCOGS > 0) {
            jeLines.push({ accountId: accCogs._id, debit: totalCOGS, credit: 0 });
            jeLines.push({ accountId: accInv._id, debit: 0, credit: totalCOGS });
            await Account.findByIdAndUpdate(accCogs._id, { $inc: { balance: totalCOGS } }); // Expense increases with Debit
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: -totalCOGS } }); // Asset decreases with Credit
        }

        await JournalEntry.create({
            entryNumber: `JE-${Date.now()}-${jeCount + 1}`,
            description: `POS Sale #${orderNumber}`,
            lines: jeLines
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Order processing error:', error);
        res.status(400).json({ message: 'Error processing order', error: error.message });
    }
});

// ----------------------------------------
// Shifts Routes
// ----------------------------------------
router.get('/shifts', async (req, res) => {
    try {
        const ShiftLog = req.tenantConnection.model('ShiftLog');
        const shifts = await ShiftLog.find().populate('cashierId').sort({ openedAt: -1 });
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shifts', error: error.message });
    }
});

router.get('/shifts/current', async (req, res) => {
    try {
        const ShiftLog = req.tenantConnection.model('ShiftLog');
        const shift = await ShiftLog.findOne({ cashierId: req.user?.id, status: 'Open' });
        res.json(shift || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current shift', error: error.message });
    }
});

router.post('/shifts/open', async (req, res) => {
    try {
        const ShiftLog = req.tenantConnection.model('ShiftLog');
        const { openingBalance } = req.body;
        const cashierId = req.user?.id;

        // Check for existing open shift
        const existingOpenShift = await ShiftLog.findOne({ cashierId, status: 'Open' });
        if (existingOpenShift) {
            return res.status(400).json({ message: 'You already have an open shift.' });
        }

        const newShift = await ShiftLog.create({
            cashierId,
            openingBalance
        });

        res.status(201).json(newShift);
    } catch (error) {
        res.status(400).json({ message: 'Error opening shift', error: error.message });
    }
});

router.post('/shifts/close/:id', async (req, res) => {
    try {
        const ShiftLog = req.tenantConnection.model('ShiftLog');
        const { closingBalance } = req.body;

        const shift = await ShiftLog.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        if (shift.status === 'Closed') return res.status(400).json({ message: 'Shift is already closed' });

        // In a real app, you'd calculate the expected balance from Order totals where paymentMethod='Cash'
        const Order = req.tenantConnection.model('Order');
        const cashOrders = await Order.aggregate([
            { $match: { cashierId: shift.cashierId, paymentMethod: 'Cash', createdAt: { $gte: shift.openedAt } } },
            { $group: { _id: null, totalCash: { $sum: '$grandTotal' } } }
        ]);
        
        const totalCashSales = cashOrders.length > 0 ? cashOrders[0].totalCash : 0;
        const expectedBalance = shift.openingBalance + totalCashSales;

        shift.closingBalance = closingBalance;
        shift.expectedBalance = expectedBalance;
        shift.closedAt = new Date();
        shift.status = 'Closed';

        await shift.save();

        res.json(shift);
    } catch (error) {
        res.status(400).json({ message: 'Error closing shift', error: error.message });
    }
});

module.exports = router;
