const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    storeName: { type: String, default: 'My Store' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#4f46e5' }, // Indigo 600
    secondaryColor: { type: String, default: '#10b981' }, // Emerald 500
    currency: { type: String, default: '$' },
    taxRate: { type: Number, default: 15 }, // Percentage
    receiptHeader: { type: String, default: 'Welcome to our store!' },
    receiptFooter: { type: String, default: 'Thank you for your purchase. Please visit again.' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    fiscalYearStart: { type: String, default: '01-01' }, // MM-DD format
    allowedLanguages: { type: [String], default: ['ar', 'en'] },
    defaultLanguage: { type: String, default: 'ar' }
}, { timestamps: true });

module.exports = settingSchema;
