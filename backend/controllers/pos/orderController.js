const { getModels } = require('./utils');

exports.getOrders = async (req, res) => {
    try {
        const { Order } = getModels(req);
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { 
            Order, Product, StockMovement, Employee, PayrollRun, Folder, File, User, 
            Customer, DebtLog, InstallmentPlan, CheckPayment, Account, JournalEntry 
        } = getModels(req);
        
        const { items, subTotal, discount, tax, grandTotal, paymentMethod, customerId, checkDetails, installmentDetails } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (['Debt', 'Installment', 'Check'].includes(paymentMethod) && !customerId) {
            return res.status(400).json({ message: `Customer is required for ${paymentMethod} payments` });
        }

        const count = await Order.countDocuments();
        const orderNumber = `ORD-${Date.now()}-${count + 1}`;

        let totalCOGS = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.name}` });
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${product.stockQuantity}` });
            }
            totalCOGS += (product.purchasePrice || 0) * item.quantity;
        }

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
        }

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
        } catch (hrError) { console.error('HR Integration Error:', hrError); }

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
        } catch (archiveError) { console.error('Archive Integration Error:', archiveError); }
        
        let customer = null;
        if (customerId) customer = await Customer.findById(customerId);

        if (paymentMethod === 'Debt' && customer) {
            customer.totalDebt = (customer.totalDebt || 0) + grandTotal;
            await customer.save();
            await DebtLog.create({
                customerId, orderId: newOrder._id, type: 'charge', amount: grandTotal, paymentMethod: 'Debt', notes: `POS Debt Sale #${orderNumber}`
            });
        } 
        else if (paymentMethod === 'Check' && customer && checkDetails) {
            await CheckPayment.create({
                customerId, orderId: newOrder._id, checkNumber: checkDetails.checkNumber, bankName: checkDetails.bankName, amount: grandTotal, dueDate: checkDetails.dueDate
            });
        }
        else if (paymentMethod === 'Installment' && customer && installmentDetails) {
            const { downPayment, months } = installmentDetails;
            const remaining = grandTotal - downPayment;
            const monthlyAmount = remaining / months;
            
            let insts = [];
            let currentDate = new Date();
            let checkNum = parseInt(installmentDetails.firstCheckNumber) || 0;
            
            for (let i = 1; i <= months; i++) {
                let dDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
                insts.push({ dueDate: dDate, amount: monthlyAmount, status: 'Pending' });

                if (installmentDetails.backedByChecks) {
                    await CheckPayment.create({
                        customerId, 
                        orderId: newOrder._id, 
                        checkNumber: (checkNum + i - 1).toString(), 
                        bankName: installmentDetails.bankName || 'Unknown Bank', 
                        amount: monthlyAmount, 
                        dueDate: dDate
                    });
                }
            }

            await InstallmentPlan.create({
                customerId, orderId: newOrder._id, totalAmount: grandTotal, remainingAmount: remaining, downPayment: downPayment, installments: insts
            });

            customer.totalDebt += remaining;
            await customer.save();

            await DebtLog.create({
                customerId, orderId: newOrder._id, type: 'charge', amount: remaining, paymentMethod: 'Installment', notes: `Installment Plan for #${orderNumber}`
            });
        }

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

        jeLines.push({ accountId: accRev._id, debit: 0, credit: grandTotal });
        await Account.findByIdAndUpdate(accRev._id, { $inc: { balance: grandTotal } });

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

        if (totalCOGS > 0) {
            jeLines.push({ accountId: accCogs._id, debit: totalCOGS, credit: 0 });
            jeLines.push({ accountId: accInv._id, debit: 0, credit: totalCOGS });
            await Account.findByIdAndUpdate(accCogs._id, { $inc: { balance: totalCOGS } });
            await Account.findByIdAndUpdate(accInv._id, { $inc: { balance: -totalCOGS } });
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
};
