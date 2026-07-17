const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    storeName: { type: String, default: 'My ERP Store' },
    logoUrl: { type: String, default: '' },
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
