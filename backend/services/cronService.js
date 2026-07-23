const cron = require('node-cron');
const Tenant = require('../models/Tenant');
const { getTenantConnection } = require('../config/tenant-db');

const initCronJobs = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running Auto-Checkout Cron Job...');
            const tenants = await Tenant.find({ status: 'active' });
            for (const tenant of tenants) {
                try {
                    const connection = getTenantConnection(tenant.dbName);
                    const Attendance = connection.model('Attendance');
                    const Employee = connection.model('Employee');
                    
                    // Find all open attendances
                    const openAttendances = await Attendance.find({ clockOut: null });
                    for (const att of openAttendances) {
                        const employee = await Employee.findById(att.employeeId).populate('shiftId');
                        if (!employee || !employee.shiftId) continue;
                        
                        const shift = employee.shiftId;
                        if (!shift.endTime) continue;
                        
                        const [sH, sM] = shift.endTime.split(':').map(Number);
                        const now = new Date();
                        
                        const attDate = new Date(att.date);
                        const shiftEndDateTime = new Date(attDate);
                        shiftEndDateTime.setHours(sH, sM, 0, 0);
                        
                        // Add 2 hours to shift end time to allow overtime check-outs, before auto-closing
                        const autoCloseTime = new Date(shiftEndDateTime);
                        autoCloseTime.setHours(autoCloseTime.getHours() + 2);
                        
                        if (now > autoCloseTime) {
                            att.clockOut = shiftEndDateTime;
                            att.isAutoClosed = true;
                            
                            // Calculate total hours
                            const start = att.clockIn ? att.clockIn : new Date(attDate.setHours(parseInt(shift.startTime.split(':')[0] || '8'), parseInt(shift.startTime.split(':')[1] || '0')));
                            let diffMs = shiftEndDateTime - start;
                            if (diffMs < 0) diffMs = 0;
                            att.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
                            
                            await att.save();
                        }
                    }
                } catch (err) {
                    console.error(`Cron error for tenant ${tenant.dbName}:`, err);
                }
            }
        } catch (error) {
            console.error('Error in Auto-Checkout Cron:', error);
        }
    });
};

module.exports = { initCronJobs };
