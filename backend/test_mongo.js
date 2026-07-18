const mongoose = require('mongoose');

const mongoUri = 'mongodb://ahmad2007fcb_db_user:Wf6bdvyXUD5YXav4@ac-kr9i09y-shard-00-00.ysqbrfj.mongodb.net:27017,ac-kr9i09y-shard-00-01.ysqbrfj.mongodb.net:27017,ac-kr9i09y-shard-00-02.ysqbrfj.mongodb.net:27017/?ssl=true&replicaSet=atlas-kx9tun-shard-0&authSource=admin&retryWrites=true&appName=Cluster0';
const dbName = 'test_tenant_xyz';

const match = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)\/?([^\?]*)(?:\?(.*))?$/);
const base = match[1];
const query = match[3] ? `?${match[3]}` : '';
const tenantUri = `${base}/${dbName}${query}`;

console.log('Connecting to:', tenantUri);

const conn = mongoose.createConnection(tenantUri);

conn.on('connected', () => {
    console.log('Connected!');
    const Schema = new mongoose.Schema({ name: String });
    const Role = conn.model('Role', Schema);
    
    Role.create({ name: 'Admin' })
        .then(() => {
            console.log('Role created successfully.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Create error:', err);
            process.exit(1);
        });
});

conn.on('error', (err) => {
    console.error('Connection error:', err);
    process.exit(1);
});
