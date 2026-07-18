const mongoose = require('mongoose');

// Tenant db
mongoose.connect('mongodb://localhost:27017/ttt?retryWrites=true&w=majority')
    .then(async () => {
        const menuCategorySchema = new mongoose.Schema({
            nameAr: { type: String, required: true },
            nameEn: { type: String, required: true },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });
        
        const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
        
        const categories = await MenuCategory.find();
        console.log("Categories found:", categories);
        process.exit(0);
    });
