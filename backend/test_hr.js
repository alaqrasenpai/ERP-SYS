const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/test_tenant');
    const Employee = mongoose.model('Employee', new mongoose.Schema({ name: String }, { timestamps: true }));
    const LeaveRequest = mongoose.model('LeaveRequest', new mongoose.Schema({ employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, status: String, startDate: Date, endDate: Date }));
    const Attendance = mongoose.model('Attendance', new mongoose.Schema({ date: Date, clockIn: Date }));
    const Shift = mongoose.model('Shift', new mongoose.Schema({ name: String }));

    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        console.log("Running HR dashboard queries...");
        const [
            totalEmployees,
            newEmployeesThisMonth,
            presentToday,
            onLeaveToday,
            pendingLeaveRequests,
            activeShifts,
            recentLeaveRequests,
            todayAttendances
        ] = await Promise.all([
            Employee.countDocuments(),
            Employee.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Attendance.countDocuments({ date: startOfDay, clockIn: { $exists: true } }),
            LeaveRequest.countDocuments({
                status: 'Approved',
                startDate: { $lte: startOfDay },
                endDate: { $gte: startOfDay }
            }),
            LeaveRequest.countDocuments({ status: 'Pending' }),
            Shift.countDocuments(),
            LeaveRequest.find({ status: 'Pending' }).populate('employeeId', 'name').sort({ createdAt: -1 }).limit(3),
            Attendance.find({ date: startOfDay })
        ]);
        console.log("Success! Employees:", totalEmployees);
    } catch(e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}
test();
