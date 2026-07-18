const mongoose = require('mongoose');

// Tenant db
mongoose.connect('mongodb://localhost:27017/ttt?retryWrites=true&w=majority')
    .then(async () => {
        const menuItemSchema = new mongoose.Schema({
            nameAr: { type: String, required: true },
            nameEn: { type: String, required: true },
            categoryAr: { type: String },
            categoryEn: { type: String },
            price: { type: Number, required: true, default: 0 },
            imageUrl: { type: String },
            descriptionAr: { type: String },
            descriptionEn: { type: String },
            preparationTimeMinutes: { type: Number, default: 15 },
            isAvailable: { type: Boolean, default: true },
            ingredients: [{
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantityUsed: { type: Number, default: 0 }
            }]
        }, { timestamps: true });
        
        const MenuItem = mongoose.model('MenuItem', menuItemSchema);
        
        try {
            const menu = await MenuItem.find().populate('ingredients.productId');
            console.log("Menu items found:", menu);
        } catch (e) {
            console.error("Error fetching menu:", e);
        }
        process.exit(0);
    });
