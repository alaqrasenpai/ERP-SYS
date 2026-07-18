const mongoUri = 'mongodb://ahmad2007fcb_db_user:Wf6bdvyXUD5YXav4@ac-kr9i09y-shard-00-00.ysqbrfj.mongodb.net:27017,ac-kr9i09y-shard-00-01.ysqbrfj.mongodb.net:27017,ac-kr9i09y-shard-00-02.ysqbrfj.mongodb.net:27017/?ssl=true&replicaSet=atlas-kx9tun-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'ttt';
let tenantUri;
const match = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)\/?([^\?]*)(?:\?(.*))?$/);
if (match) {
    const base = match[1];
    const query = match[3] ? `?${match[3]}` : '';
    tenantUri = `${base}/${dbName}${query}`;
} else {
    tenantUri = 'no match';
}
console.log(tenantUri);
