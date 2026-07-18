const { getModels } = require('./utils');

exports.getCategories = async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const categories = await MenuCategory.find();
        res.json(categories);
    } catch (err) { 
        console.error('Error in getCategories:', err);
        res.status(500).json({ error: err.message }); 
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const cat = await MenuCategory.create(req.body);
        res.json(cat);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCategory = async (req, res) => {
    try {
        const { MenuCategory } = getModels(req);
        const cat = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(cat);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
