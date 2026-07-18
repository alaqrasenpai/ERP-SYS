const { getModels } = require('./utils');

exports.getDepartments = async (req, res) => {
    try {
        const { Department } = getModels(req);
        const depts = await Department.find().populate('parentDepartmentId').populate('managerId').sort({ createdAt: -1 });
        res.json(depts);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createDepartment = async (req, res) => {
    try {
        const { Department } = getModels(req);
        const dept = await Department.create(req.body);
        res.status(201).json(dept);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { Department } = getModels(req);
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(dept);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { Department } = getModels(req);
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
