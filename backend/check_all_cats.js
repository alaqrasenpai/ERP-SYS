const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/')
    .then(async () => {
        const adminDb = mongoose.connection.client.db('admin');
        const { databases } = await adminDb.admin().listDatabases();
        
        for (let dbInfo of databases) {
            const dbName = dbInfo.name;
            if (dbName === 'admin' || dbName === 'local' || dbName === 'config') continue;
            
            const db = mongoose.connection.client.db(dbName);
            const categories = await db.collection('menucategories').find({}).toArray();
            if (categories.length > 0) {
                console.log(`DB: ${dbName} -> Categories:`, categories);
            }
        }
        process.exit(0);
    });
