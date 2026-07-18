const { getModels } = require('./utils');

exports.getSuppliers = async (req, res) => {
    try {
        const { Supplier } = getModels(req);
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const { Supplier } = getModels(req);
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: 'Error creating supplier', error: error.message });
    }
};
