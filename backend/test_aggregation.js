const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/test_tenant');
    const Product = mongoose.model('Product', new mongoose.Schema({
        stockQuantity: Number,
        alertQuantity: Number,
        unitPrice: Number
    }));

    try {
        console.log("Testing count...");
        const count = await Product.countDocuments({ $expr: { $lte: [{ $ifNull: ['$stockQuantity', 0] }, { $ifNull: ['$alertQuantity', 0] }] } });
        console.log("Count:", count);

        console.log("Testing aggregate...");
        const agg = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: [{ $ifNull: ['$stockQuantity', 0] }, { $ifNull: ['$unitPrice', 0] }] } } } }
        ]);
        console.log("Agg:", agg);
    } catch(e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}
test();
