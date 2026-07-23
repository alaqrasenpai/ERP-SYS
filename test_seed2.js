const http = require('http');

const tenantId = 'alaqrasenpai/ERP-SYS';
const loginData = JSON.stringify({ email: 'admin@alaqra.dev', password: 'password123' });

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'x-tenant-id': tenantId,
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(loginOptions, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (!json.token) {
        console.log('Login failed:', data);
        return;
    }
    const token = json.token;
    console.log('Got token');

    const seedOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/settings/seed',
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req2 = http.request(seedOptions, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => console.log('Seed Response:', data2));
    });
    req2.end();
  });
});
req.write(loginData);
req.end();
