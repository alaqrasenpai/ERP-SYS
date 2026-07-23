const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/erp-sys').then(async () => {
    const tenants = await mongoose.connection.db.collection('tenants').find({}).toArray();
    console.log(tenants.map(t => t.tenantId));
    process.exit(0);
});
