const { getModels } = require('./utils');

exports.getSections = async (req, res) => {
    try {
        const { TableSection } = getModels(req);
        const sections = await TableSection.find();
        res.json(sections);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSection = async (req, res) => {
    try {
        const { TableSection } = getModels(req);
        const section = await TableSection.create(req.body);
        res.json(section);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSection = async (req, res) => {
    try {
        const { TableSection } = getModels(req);
        const section = await TableSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(section);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSection = async (req, res) => {
    try {
        const { TableSection } = getModels(req);
        await TableSection.findByIdAndDelete(req.params.id);
        res.json({ message: 'Section deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
