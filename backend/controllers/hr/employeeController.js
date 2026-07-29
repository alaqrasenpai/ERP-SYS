const { getModels } = require('./utils');

exports.getEmployees = async (req, res) => {
    try {
        const { Employee } = getModels(req);
        const employees = await Employee.find()
            .populate('jobTitleId')
            .populate('departmentId')
            .populate('shiftId')
            .populate('userId', 'name email')
            .populate('assignedAllowances.allowanceTypeId')
            .sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { Employee } = getModels(req);
        const User = req.tenantConnection.model('User');
        const newEmployee = await Employee.create(req.body);

        if (req.body.userId) {
            await User.findByIdAndUpdate(req.body.userId, { employeeId: newEmployee._id });
        }

        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating employee', error: error.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { Employee } = getModels(req);
        const User = req.tenantConnection.model('User');
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });

        if (req.body.userId) {
            await User.updateMany({ employeeId: updatedEmployee._id }, { $unset: { employeeId: "" } });
            await User.findByIdAndUpdate(req.body.userId, { employeeId: updatedEmployee._id });
        } else if (req.body.userId === null) {
            await User.updateMany({ employeeId: updatedEmployee._id }, { $unset: { employeeId: "" } });
        }

        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error updating employee', error: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { Employee } = getModels(req);
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting employee', error: error.message });
    }
};

exports.updateLeaveBalances = async (req, res) => {
    try {
        const { Employee, LeaveType } = getModels(req);
        const { annualLeaveBalance, sickLeaveBalance, activeLeaveBalances } = req.body;
        
        const updateData = {};
        if (annualLeaveBalance !== undefined) updateData.annualLeaveBalance = annualLeaveBalance;
        if (sickLeaveBalance !== undefined) updateData.sickLeaveBalance = sickLeaveBalance;
        if (activeLeaveBalances !== undefined) updateData.activeLeaveBalances = activeLeaveBalances;
        
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        
        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error updating leave balances', error: error.message });
    }
};

