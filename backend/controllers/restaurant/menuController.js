const { getModels } = require('./utils');

exports.getMenu = async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const menu = await MenuItem.find();
        res.json(menu);
    } catch (err) { 
        console.error('Error in getMenu:', err);
        res.status(500).json({ error: err.message }); 
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const item = await MenuItem.create(req.body);
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { MenuItem } = getModels(req);
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
