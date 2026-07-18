const { getModels } = require('./utils');

exports.getShifts = async (req, res) => {
    try {
        const { ShiftLog } = getModels(req);
        const shifts = await ShiftLog.find().populate('cashierId').sort({ openedAt: -1 });
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shifts', error: error.message });
    }
};

exports.getCurrentShift = async (req, res) => {
    try {
        const { ShiftLog } = getModels(req);
        const shift = await ShiftLog.findOne({ cashierId: req.user?.id, status: 'Open' });
        res.json(shift || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current shift', error: error.message });
    }
};

exports.openShift = async (req, res) => {
    try {
        const { ShiftLog } = getModels(req);
        const { openingBalance } = req.body;
        const cashierId = req.user?.id;

        const existingOpenShift = await ShiftLog.findOne({ cashierId, status: 'Open' });
        if (existingOpenShift) {
            return res.status(400).json({ message: 'You already have an open shift.' });
        }

        const newShift = await ShiftLog.create({ cashierId, openingBalance });
        res.status(201).json(newShift);
    } catch (error) {
        res.status(400).json({ message: 'Error opening shift', error: error.message });
    }
};

exports.closeShift = async (req, res) => {
    try {
        const { ShiftLog, Order } = getModels(req);
        const { closingBalance } = req.body;

        const shift = await ShiftLog.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        if (shift.status === 'Closed') return res.status(400).json({ message: 'Shift is already closed' });

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
};
