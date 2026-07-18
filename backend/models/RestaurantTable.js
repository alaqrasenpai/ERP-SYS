const mongoose = require('mongoose');

const restaurantTableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 2 },
    section: { type: String, default: 'Indoor' },
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOrder', default: null }
}, { timestamps: true });

module.exports = restaurantTableSchema;
