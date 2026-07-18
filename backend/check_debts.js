const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const tenants = await mongoose.connection.db.collection('tenants').find({}).toArray();
    for (const tenant of tenants) {
        const tenantDb = mongoose.connection.useDb(`tenant_${tenant.tenantId}`);
        const Order = tenantDb.collection('orders');
        const orders = await Order.find({ paymentMethod: 'Debt' }).toArray();
        if (orders.length > 0) {
            console.log(`Tenant ${tenant.tenantId} has ${orders.length} Debt orders`);
            orders.forEach(o => console.log(`  > Order ${o.orderNumber} - customerId: ${o.customerId}`));
        }
    }
    process.exit(0);
  });
