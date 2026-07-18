const mongoose = require('mongoose');

async function checkDbs() {
    try {
        const conn = await mongoose.createConnection('mongodb://localhost:27017/').asPromise();
        const adminDb = conn.db.admin();
        const dbs = await adminDb.listDatabases();
        
        console.log('--- Databases ---');
        for (let dbInfo of dbs.databases) {
            console.log(`Database: ${dbInfo.name}`);
            const db = conn.client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            const colNames = collections.map(c => c.name);
            console.log(`Collections: ${colNames.join(', ')}`);
            
            if (colNames.includes('tenants')) {
                const count = await db.collection('tenants').countDocuments();
                console.log(`=> This database has a 'tenants' collection with ${count} tenants!`);
            }
            console.log('-----------------');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDbs();
