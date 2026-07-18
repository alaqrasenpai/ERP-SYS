const { getModels, BiometricDevice } = require('./utils');

exports.getDevices = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const devices = await BiometricDevice.find({ tenantId });
        res.json(devices);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createDevice = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const deviceData = { ...req.body, tenantId };
        const device = await BiometricDevice.create(deviceData);
        res.status(201).json(device);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteDevice = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        await BiometricDevice.findOneAndDelete({ _id: req.params.id, tenantId });
        res.json({ message: 'Device deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
