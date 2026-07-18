const { getModels } = require('./utils');

exports.getHolidays = async (req, res) => {
    try {
        const { Holiday } = getModels(req);
        const holidays = await Holiday.find().sort({ fromDate: -1 });
        res.json(holidays);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createHoliday = async (req, res) => {
    try {
        const { Holiday } = getModels(req);
        const holiday = await Holiday.create(req.body);
        res.status(201).json(holiday);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.updateHoliday = async (req, res) => {
    try {
        const { Holiday } = getModels(req);
        const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(holiday);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const { Holiday } = getModels(req);
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
