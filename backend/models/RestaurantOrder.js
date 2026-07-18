const mongoose = require('mongoose');

const restaurantOrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    orderType: { type: String, enum: ['Dine-In', 'Takeaway', 'Delivery'], default: 'Dine-In' },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantTable' },
    waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        nameAr: String,
        nameEn: String,
        price: Number,
        quantity: Number,
        notes: String,
        kitchenStatus: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Served'], default: 'Pending' }
    }],
    
    deliveryDetails: {
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryProvider' },
        providerName: String,
        externalOrderId: String,
        customerName: String,
        customerPhone: String
    },
    
    financials: {
        subTotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        aggregatorCommission: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },
        netRestaurantRevenue: { type: Number, default: 0 }
    },
    
    status: { type: String, enum: ['Open', 'Paid', 'Cancelled'], default: 'Open' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Aggregator Credit', 'Unpaid'], default: 'Unpaid' }
}, { timestamps: true });

// Auto-increment orderNumber before saving
restaurantOrderSchema.pre('save', async function() {
    if (this.isNew && !this.orderNumber) {
        // Find the last order to increment
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
        if (lastOrder && lastOrder.orderNumber && lastOrder.orderNumber.startsWith('R-ORD-')) {
            const lastNum = parseInt(lastOrder.orderNumber.replace('R-ORD-', ''), 10);
            this.orderNumber = `R-ORD-${(lastNum + 1).toString().padStart(5, '0')}`;
        } else {
            this.orderNumber = 'R-ORD-00001';
        }
    }
});

module.exports = restaurantOrderSchema;
