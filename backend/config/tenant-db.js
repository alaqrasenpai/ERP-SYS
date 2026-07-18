const mongoose = require('mongoose');
const roleSchema = require('../models/Role');
const userSchema = require('../models/User');
const productSchema = require('../models/Product');
const warehouseSchema = require('../models/Warehouse');
const supplierSchema = require('../models/Supplier');
const stockMovementSchema = require('../models/StockMovement');
const fileSchema = require('../models/File');
const folderSchema = require('../models/Folder');
const stockAdjustmentSchema = require('../models/StockAdjustment');
const categorySchema = require('../models/Category');
const employeeSchema = require('../models/Employee');
const attendanceSchema = require('../models/Attendance');
const attendanceAuditSchema = require('../models/AttendanceAudit');
const payrollRunSchema = require('../models/PayrollRun');
const departmentSchema = require('../models/Department');
const shiftSchema = require('../models/Shift');
const holidaySchema = require('../models/Holiday');
const leaveRequestSchema = require('../models/LeaveRequest');
const orderSchema = require('../models/Order');
const shiftLogSchema = require('../models/ShiftLog');
const customerSchema = require('../models/Customer');
const debtLogSchema = require('../models/DebtLog');
const installmentPlanSchema = require('../models/InstallmentPlan');
const checkPaymentSchema = require('../models/CheckPayment');
const accountSchema = require('../models/Account');
const journalEntrySchema = require('../models/JournalEntry');
const settingSchema = require('../models/Setting');

// Restaurant
const deliveryProviderSchema = require('../models/DeliveryProvider');
const restaurantTableSchema = require('../models/RestaurantTable');
const tableSectionSchema = require('../models/TableSection');
const menuItemSchema = require('../models/MenuItem');
const restaurantOrderSchema = require('../models/RestaurantOrder');
const menuCategorySchema = require('../models/MenuCategory');
// Cache to store the existing tenant database connections
const connectionCache = new Map();

/**
 * Get or create a database connection for a specific tenant
 * @param {string} dbName - The tenant's specific database name
 * @returns {mongoose.Connection} - The tenant's mongoose connection
 */
const getTenantConnection = (dbName) => {
    // If the connection already exists in the cache, reuse it
    if (connectionCache.has(dbName)) {
        return connectionCache.get(dbName);
    }

    // Build the URI for the tenant database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    // Remove trailing slash if any, then append dbName
    const baseUri = mongoUri.replace(/\/$/, '');
    const tenantUri = `${baseUri}/${dbName}?retryWrites=true&w=majority`;

    // Create a new connection
    const connection = mongoose.createConnection(tenantUri);

    // Register tenant-specific models dynamically to this connection
    connection.model('Role', roleSchema);
    connection.model('User', userSchema);
    connection.model('Product', productSchema);
    connection.model('Warehouse', warehouseSchema);
    connection.model('Supplier', supplierSchema);
    connection.model('Category', categorySchema);
    connection.model('StockMovement', stockMovementSchema);
    connection.model('StockAdjustment', stockAdjustmentSchema);
    connection.model('File', fileSchema);
    connection.model('Folder', folderSchema);
    
    // HR & Payroll
    connection.model('Employee', employeeSchema);
    connection.model('Attendance', attendanceSchema);
    connection.model('AttendanceAudit', attendanceAuditSchema);
    connection.model('PayrollRun', payrollRunSchema);
    connection.model('Department', departmentSchema);
    connection.model('Shift', shiftSchema);
    connection.model('Holiday', holidaySchema);
    connection.model('LeaveRequest', leaveRequestSchema);

    // POS
    connection.model('Order', orderSchema);
    connection.model('ShiftLog', shiftLogSchema);
    connection.model('Customer', customerSchema);
    connection.model('DebtLog', debtLogSchema);
    connection.model('InstallmentPlan', installmentPlanSchema);
    connection.model('CheckPayment', checkPaymentSchema);
    connection.model('Account', accountSchema);
    connection.model('JournalEntry', journalEntrySchema);
    connection.model('Setting', settingSchema);

    // Restaurant
    connection.model('DeliveryProvider', deliveryProviderSchema);
    connection.model('RestaurantTable', restaurantTableSchema);
    connection.model('TableSection', tableSectionSchema);
    connection.model('MenuItem', menuItemSchema);
    connection.model('RestaurantOrder', restaurantOrderSchema);
    connection.model('MenuCategory', menuCategorySchema);

    // Cache the active connection for future requests
    connectionCache.set(dbName, connection);

    connection.on('connected', () => {
        console.log(`Connected to tenant database: ${dbName}`);
    });
    
    connection.on('error', (err) => {
        console.error(`Error connecting to tenant database ${dbName}:`, err);
    });

    return connection;
};

module.exports = { getTenantConnection };
