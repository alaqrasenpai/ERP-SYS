const { getModels } = require('./utils');

exports.getTables = async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        const tables = await RestaurantTable.find().populate('currentOrderId');
        res.json(tables);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTable = async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        const table = await RestaurantTable.create(req.body);
        res.json(table);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTable = async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        const table = await RestaurantTable.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(table);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteTable = async (req, res) => {
    try {
        const { RestaurantTable } = getModels(req);
        await RestaurantTable.findByIdAndDelete(req.params.id);
        res.json({ message: 'Table deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
