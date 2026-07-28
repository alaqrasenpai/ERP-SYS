const getAllowanceTypes = async (req, res) => {
    try {
        const AllowanceType = req.tenantConnection.model('AllowanceType');
        const types = await AllowanceType.find();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching allowance types', error: error.message });
    }
};

const createAllowanceType = async (req, res) => {
    try {
        const AllowanceType = req.tenantConnection.model('AllowanceType');
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        const type = await AllowanceType.create({ name, description });
        res.status(201).json(type);
    } catch (error) {
        res.status(400).json({ message: 'Error creating allowance type', error: error.message });
    }
};

const updateAllowanceType = async (req, res) => {
    try {
        const AllowanceType = req.tenantConnection.model('AllowanceType');
        const { name, description } = req.body;
        
        const type = await AllowanceType.findById(req.params.id);
        if (!type) return res.status(404).json({ message: 'Not found' });
        
        if (name) type.name = name;
        if (description !== undefined) type.description = description;
        
        await type.save();
        res.json(type);
    } catch (error) {
        res.status(400).json({ message: 'Error updating allowance type', error: error.message });
    }
};

const deleteAllowanceType = async (req, res) => {
    try {
        const AllowanceType = req.tenantConnection.model('AllowanceType');
        const Employee = req.tenantConnection.model('Employee');
        
        const type = await AllowanceType.findById(req.params.id);
        if (!type) return res.status(404).json({ message: 'Not found' });
        
        // Remove from employees who have it assigned
        await Employee.updateMany(
            { 'assignedAllowances.allowanceTypeId': type._id },
            { $pull: { assignedAllowances: { allowanceTypeId: type._id } } }
        );
        
        await type.deleteOne();
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting allowance type', error: error.message });
    }
};

module.exports = {
    getAllowanceTypes,
    createAllowanceType,
    updateAllowanceType,
    deleteAllowanceType
};
