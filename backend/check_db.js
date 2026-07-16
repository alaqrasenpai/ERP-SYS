const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/new');
    console.log("Connected to db 'new'");
    
    // define schema
    const roleSchema = new mongoose.Schema({ name: String });
    const userSchema = new mongoose.Schema({ email: String, password: String, role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' } });
    
    const Role = mongoose.model('Role', roleSchema);
    const User = mongoose.model('User', userSchema);
    
    const roles = await Role.find();
    console.log('Roles in DB:', roles);
    
    const users = await User.find().populate('role');
    console.log('Users in DB:', users);
    
    mongoose.disconnect();
}

test();
