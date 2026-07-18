const { getModels } = require('./utils');

exports.getShifts = async (req, res) => {
    try {
        const { Shift } = getModels(req);
        const shifts = await Shift.find().sort({ createdAt: -1 });
        res.json(shifts);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createShift = async (req, res) => {
    try {
        const { Shift } = getModels(req);
        const shift = await Shift.create(req.body);
        res.status(201).json(shift);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.updateShift = async (req, res) => {
    try {
        const { Shift } = getModels(req);
        const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(shift);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteShift = async (req, res) => {
    try {
        const { Shift } = getModels(req);
        await Shift.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
