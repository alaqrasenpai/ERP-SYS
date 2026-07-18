require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Middlewares
const tenantResolver = require('./middlewares/tenantResolver');
const { verifyToken } = require('./middlewares/authMiddleware');
const { requireModule } = require('./middlewares/moduleGuard');

// Import Routes
const superAdminRoutes = require('./routes/superAdmin');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const archiveRoutes = require('./routes/archive');
const usersRoutes = require('./routes/users');
const hrRoutes = require('./routes/hr');
const posRoutes = require('./routes/pos');
const dashboardRoutes = require('./routes/dashboard');
const customersRoutes = require('./routes/customers');
const financeRoutes = require('./routes/finance');
const suppliersRoutes = require('./routes/suppliers');
const settingsRoutes = require('./routes/settings');
const reportsRoutes = require('./routes/reports');
const teamRoutes = require('./routes/team');
const zktecoRoutes = require('./routes/zkteco');
const essRoutes = require('./routes/ess');
const restaurantRoutes = require('./routes/restaurant');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to the Central Admin Database (Master DB)
// This connection is used strictly for central operations like looking up tenants
const centralDbUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
mongoose.connect(centralDbUri).then(() => {
    console.log('Connected to Central Master Database');
}).catch((err) => {
    console.error('Central Master Database Connection Error:', err);
    process.exit(1);
});

// -----------------------------------------------------
// Route Mappings
// -----------------------------------------------------

// 1. Central Admin Routes
// No tenant resolver is required here because these interact with the master DB
app.use('/api/super', superAdminRoutes);

// Global Hardware Webhooks
app.use('/api/zkteco', zktecoRoutes);

// 2. Tenant-Specific Routes
// The tenantResolver middleware MUST be used for these routes.
// It will determine the tenant from 'x-tenant-id', locate the specific database,
// and attach the connection object to `req.tenantConnection`.
app.use('/api/auth', tenantResolver, authRoutes);
app.use('/api/dashboard', verifyToken, tenantResolver, dashboardRoutes);
app.use('/api/settings', verifyToken, tenantResolver, settingsRoutes);
app.use('/api/reports', verifyToken, tenantResolver, reportsRoutes);
app.use('/api/customers', verifyToken, tenantResolver, customersRoutes);
app.use('/api/suppliers', verifyToken, tenantResolver, suppliersRoutes);
app.use('/api/ess', verifyToken, tenantResolver, essRoutes);

// Protected Core Modules
app.use('/api/inventory', verifyToken, tenantResolver, requireModule('inventory'), inventoryRoutes);
app.use('/api/archive', verifyToken, tenantResolver, requireModule('archive'), archiveRoutes);
app.use('/api/users', verifyToken, tenantResolver, usersRoutes); // Global users fallback if needed
app.use('/api/team', verifyToken, tenantResolver, teamRoutes);
app.use('/api/hr', verifyToken, tenantResolver, requireModule('hr'), hrRoutes);
app.use('/api/pos', verifyToken, tenantResolver, requireModule('pos'), posRoutes);
app.use('/api/finance', verifyToken, tenantResolver, requireModule('accounting'), financeRoutes);
app.use('/api/restaurant', verifyToken, tenantResolver, requireModule('restaurant'), restaurantRoutes);

// Public Routes (No Auth)
const publicRoutes = require('./routes/public');
app.use('/api/public', tenantResolver, publicRoutes);

// Future tenant routes can be mounted securely here:
// app.use('/api/inventory', tenantResolver, inventoryRoutes);
// app.use('/api/payroll', tenantResolver, payrollRoutes);

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'API Route Not Found' });
});

// Start the Express Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
