const mongoose = require('mongoose');

const journalEntryLineSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 }
});

const journalEntrySchema = new mongoose.Schema({
    entryNumber: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    lines: [journalEntryLineSchema]
}, { timestamps: true });

module.exports = journalEntrySchema;
