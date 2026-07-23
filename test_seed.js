const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/settings/seed',
  method: 'POST',
  headers: {
    'x-tenant-id': 'alaqrasenpai/ERP-SYS',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', error => {
  console.error(error);
});

req.end();
