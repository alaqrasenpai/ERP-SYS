// A script to login and hit /api/restaurant/menu
const fetch = require('node-fetch');

async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'ttt' },
            body: JSON.stringify({ email: 'admin@ttt.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log('Login:', loginData.token ? 'Success' : loginData);

        const menuRes = await fetch('http://localhost:5000/api/restaurant/menu', {
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'x-tenant-id': 'ttt'
            }
        });
        console.log('Menu Status:', menuRes.status);
        console.log('Menu Response:', await menuRes.json());
        
        const catRes = await fetch('http://localhost:5000/api/restaurant/categories', {
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'x-tenant-id': 'ttt'
            }
        });
        console.log('Cat Status:', catRes.status);
        console.log('Cat Response:', await catRes.json());

    } catch (e) {
        console.error(e);
    }
}
test();
