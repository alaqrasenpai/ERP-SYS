const { getModels } = require('./utils');

exports.getJobTitles = async (req, res) => {
    try {
        const JobTitle = req.tenantConnection.model('JobTitle');
        const jobs = await JobTitle.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job titles', error: error.message });
    }
};

exports.createJobTitle = async (req, res) => {
    try {
        const JobTitle = req.tenantConnection.model('JobTitle');
        const newJob = await JobTitle.create(req.body);
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: 'Error creating job title', error: error.message });
    }
};

exports.updateJobTitle = async (req, res) => {
    try {
        const JobTitle = req.tenantConnection.model('JobTitle');
        const updatedJob = await JobTitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJob) return res.status(404).json({ message: 'Job title not found' });
        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: 'Error updating job title', error: error.message });
    }
};

exports.deleteJobTitle = async (req, res) => {
    try {
        const JobTitle = req.tenantConnection.model('JobTitle');
        const Employee = req.tenantConnection.model('Employee');
        
        // Check if any employee is using this job title
        const employeesUsingJob = await Employee.countDocuments({ jobTitleId: req.params.id });
        if (employeesUsingJob > 0) {
            return res.status(400).json({ message: 'Cannot delete job title as it is assigned to one or more employees.' });
        }

        await JobTitle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job title deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting job title', error: error.message });
    }
};
