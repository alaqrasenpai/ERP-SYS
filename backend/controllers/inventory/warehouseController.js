const { getModels } = require('./utils');

exports.getWarehouses = async (req, res) => {
    try {
        const { Warehouse } = getModels(req);
        const warehouses = await Warehouse.find();
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching warehouses', error: error.message });
    }
};

exports.createWarehouse = async (req, res) => {
    try {
        const { Warehouse } = getModels(req);
        const newWarehouse = await Warehouse.create(req.body);
        res.status(201).json(newWarehouse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating warehouse', error: error.message });
    }
};
