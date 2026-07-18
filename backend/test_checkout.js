const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const tenantDb = mongoose.connection.useDb('tenant_alaqrasenpai/ERP-SYS'); // Wait, what is the tenant ID? Let's check tenants collection.
  
  const tenants = await mongoose.connection.db.collection('tenants').find({}).toArray();
  console.log("Tenants:", tenants.map(t => t.tenantId));

  process.exit(0);
}
run();
