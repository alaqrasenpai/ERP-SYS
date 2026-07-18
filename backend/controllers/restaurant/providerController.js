const { getModels } = require('./utils');

exports.getProviders = async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const provs = await DeliveryProvider.find();
        res.json(provs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProvider = async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const prov = await DeliveryProvider.create(req.body);
        res.json(prov);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProvider = async (req, res) => {
    try {
        const { DeliveryProvider } = getModels(req);
        const prov = await DeliveryProvider.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(prov);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
