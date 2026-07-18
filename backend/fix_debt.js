const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    // For each tenant
    const tenants = await mongoose.connection.db.collection('tenants').find({}).toArray();
    for (const tenant of tenants) {
        console.log(`Processing tenant ${tenant.tenantId}`);
        const tenantDb = mongoose.connection.useDb(`tenant_${tenant.tenantId}`);
        const Customer = tenantDb.collection('customers');
        const DebtLog = tenantDb.collection('debtlogs');

        const customers = await Customer.find({}).toArray();
        for (const c of customers) {
            // If totalDebt is NaN, null, undefined, or we just want to recalculate it:
            const logs = await DebtLog.find({ customerId: c._id }).toArray();
            let calculatedDebt = 0;
            for (const log of logs) {
                if (log.type === 'charge') calculatedDebt += log.amount;
                else if (log.type === 'payment') calculatedDebt -= log.amount;
            }
            if (c.totalDebt !== calculatedDebt) {
                console.log(`Fixing customer ${c.name}: old=${c.totalDebt}, new=${calculatedDebt}`);
                await Customer.updateOne({ _id: c._id }, { $set: { totalDebt: calculatedDebt } });
            }
        }
    }
    console.log('Done');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
