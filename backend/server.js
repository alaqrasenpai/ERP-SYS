require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Middlewares
const tenantResolver = require('./middlewares/tenantResolver');
const { authMiddleware } = require('./middlewares/authMiddleware');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());

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

// 2. Tenant-Specific Routes
// The tenantResolver middleware MUST be used for these routes.
// It will determine the tenant from 'x-tenant-id', locate the specific database,
// and attach the connection object to `req.tenantConnection`.
app.use('/api/auth', tenantResolver, authRoutes);
app.use('/api/dashboard', authMiddleware, tenantResolver, dashboardRoutes);
app.use('/api/settings', authMiddleware, tenantResolver, settingsRoutes);
app.use('/api/reports', authMiddleware, tenantResolver, reportsRoutes);
app.use('/api/customers', authMiddleware, tenantResolver, customersRoutes);
app.use('/api/suppliers', authMiddleware, tenantResolver, suppliersRoutes);

// Protected Core Modules
app.use('/api/inventory', authMiddleware, tenantResolver, requireModule('inventory'), inventoryRoutes);
app.use('/api/archive', authMiddleware, tenantResolver, requireModule('archive'), archiveRoutes);
app.use('/api/users', authMiddleware, tenantResolver, usersRoutes); // Global users fallback if needed
app.use('/api/team', authMiddleware, tenantResolver, teamRoutes);
app.use('/api/hr', authMiddleware, tenantResolver, requireModule('hr'), hrRoutes);
app.use('/api/pos', authMiddleware, tenantResolver, requireModule('pos'), posRoutes);
app.use('/api/finance', authMiddleware, tenantResolver, requireModule('accounting'), financeRoutes);
app.use('/api/reports', authMiddleware, tenantResolver, reportsRoutes);

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
