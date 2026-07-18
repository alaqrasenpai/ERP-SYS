const { getModels } = require('./utils');

exports.getCategories = async (req, res) => {
    try {
        const { Category } = getModels(req);
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { Category } = getModels(req);
        const newCategory = await Category.create(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
};
