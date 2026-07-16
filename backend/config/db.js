const mongoose = require('mongoose');

// Connect to the main administrative database
const connectMasterDB = async () => {
    try {
        await mongoose.connect(process.env.MASTER_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to Master Database');
    } catch (error) {
        console.error('Master Database Connection Error:', error);
        process.exit(1);
    }
};

// Retrieve a connection for a specific tenant database
const getTenantConnection = (tenantId) => {
    const dbName = `tenant_${tenantId}`;
    return mongoose.connection.useDb(dbName, { useCache: true });
};

module.exports = { connectMasterDB, getTenantConnection };
