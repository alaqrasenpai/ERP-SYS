const { getModels } = require('./utils');

exports.getProducts = async (req, res) => {
    try {
        const { Product } = getModels(req);
        const products = await Product.find().populate('supplier warehouseId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { Product } = getModels(req);
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { Product } = getModels(req);
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { Product } = getModels(req);
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const { Product } = getModels(req);
        const products = await Product.find({ $expr: { $lte: ['$stockQuantity', '$alertQuantity'] } }).populate('supplier warehouseId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
    }
};
