const { getModels, ensureDefaultAccounts } = require('./utils');

exports.getAccounts = async (req, res) => {
    try {
        await ensureDefaultAccounts(req);
        const { Account } = getModels(req);
        const accounts = await Account.find().sort({ code: 1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
};

exports.getJournalEntries = async (req, res) => {
    try {
        const { JournalEntry } = getModels(req);
        const entries = await JournalEntry.find().populate('lines.accountId').sort({ date: -1 }).limit(100);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
    }
};
