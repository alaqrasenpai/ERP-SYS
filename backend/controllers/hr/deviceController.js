const { getModels, BiometricDevice, DeviceLog } = require('./utils');
const ZKLib = require('node-zklib');

exports.getDevices = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const devices = await BiometricDevice.find({ tenantId });
        res.json(devices);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createDevice = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const deviceData = { ...req.body, tenantId };
        const device = await BiometricDevice.create(deviceData);
        res.status(201).json(device);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteDevice = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        await BiometricDevice.findOneAndDelete({ _id: req.params.id, tenantId });
        res.json({ message: 'Device deleted' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.fetchLogs = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const { Employee, Attendance } = getModels(req);
        
        const device = await BiometricDevice.findOne({ _id: req.params.id, tenantId });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        
        if (!device.ipAddress) return res.status(400).json({ message: 'Device IP address is missing' });
        
        const zkInstance = new ZKLib({
            ip: device.ipAddress,
            port: device.port || 4370,
            timeout: 10000,
            inport: 5200
        });

        await zkInstance.createSocket();
        
        try {
            await zkInstance.connect();
        } catch (e) {
            return res.status(500).json({ message: 'Failed to connect to device. Ensure it is online on the local network.', error: e.message });
        }
        
        const attendances = await zkInstance.getAttendances();
        await zkInstance.disconnect();
        await zkInstance.freeData(); // Optional, clears the logs in device if required by ZKTeco but generally just free local memory

        if (!attendances || !attendances.data || attendances.data.length === 0) {
            return res.json({ message: 'No logs found on device', count: 0 });
        }

        let addedCount = 0;
        let processedCount = 0;

        for (const log of attendances.data) {
            const { deviceUserId, recordTime } = log; 
            // deviceUserId is typically the ID/employee number on the device
            
            const existingLog = await DeviceLog.findOne({
                deviceId: device._id,
                deviceEmployeeNumber: deviceUserId,
                recordTime: new Date(recordTime)
            });

            if (!existingLog) {
                // Determine if we have an employee matching this number
                const employee = await Employee.findOne({ employeeNumber: deviceUserId });
                
                let newLog = new DeviceLog({
                    deviceId: device._id,
                    tenantId,
                    deviceEmployeeNumber: deviceUserId,
                    recordTime: new Date(recordTime),
                    status: employee ? 'Processed' : 'Pending',
                    linkedEmployeeId: employee ? employee._id : null
                });
                
                await newLog.save();
                addedCount++;
                
                // If matched, create an attendance record directly
                if (employee) {
                    const todayStr = new Date(recordTime).toISOString().split('T')[0];
                    let att = await Attendance.findOne({ employeeId: employee._id, date: todayStr });
                    if (!att) {
                        await Attendance.create({
                            employeeId: employee._id,
                            date: todayStr,
                            clockIn: new Date(recordTime),
                            status: 'Present',
                            punchInType: 'Fingerprint',
                            deviceId: device.serialNumber
                        });
                    } else if (!att.clockOut && att.clockIn < new Date(recordTime)) {
                        att.clockOut = new Date(recordTime);
                        att.punchOutType = 'Fingerprint';
                        const diffMs = att.clockOut - att.clockIn;
                        att.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
                        await att.save();
                    }
                    processedCount++;
                }
            }
        }

        res.json({ message: 'Logs fetched successfully', addedLogs: addedCount, processedLogs: processedCount });
    } catch (error) {
        console.error('Fetch Logs Error:', error);
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
};

exports.getPendingLogs = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const logs = await DeviceLog.find({ tenantId, status: 'Pending' }).populate('deviceId').sort({ recordTime: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending logs', error: error.message });
    }
};

exports.linkLog = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const { Employee, Attendance } = getModels(req);
        const { employeeId } = req.body;
        
        const log = await DeviceLog.findOne({ _id: req.params.id, tenantId });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        
        // Update employee's employeeNumber so future logs auto-link
        employee.employeeNumber = log.deviceEmployeeNumber;
        await employee.save();
        
        // Update all pending logs for this deviceEmployeeNumber
        const pendingLogs = await DeviceLog.find({ tenantId, deviceEmployeeNumber: log.deviceEmployeeNumber, status: 'Pending' });
        
        for (const pLog of pendingLogs) {
            pLog.status = 'Processed';
            pLog.linkedEmployeeId = employee._id;
            await pLog.save();
            
            const todayStr = new Date(pLog.recordTime).toISOString().split('T')[0];
            let att = await Attendance.findOne({ employeeId: employee._id, date: todayStr });
            if (!att) {
                await Attendance.create({
                    employeeId: employee._id,
                    date: todayStr,
                    clockIn: new Date(pLog.recordTime),
                    status: 'Present',
                    punchInType: 'Fingerprint',
                    deviceId: pLog.deviceId
                });
            } else if (!att.clockOut && att.clockIn < new Date(pLog.recordTime)) {
                att.clockOut = new Date(pLog.recordTime);
                att.punchOutType = 'Fingerprint';
                const diffMs = att.clockOut - att.clockIn;
                att.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
                await att.save();
            }
        }
        
        res.json({ message: 'Logs linked successfully and Employee number updated', linkedCount: pendingLogs.length });
    } catch (error) {
        res.status(500).json({ message: 'Error linking log', error: error.message });
    }
};
