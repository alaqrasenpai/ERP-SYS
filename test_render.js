const http = require('https');

http.get('https://erp-sys-71b6.onrender.com/api/super/tenants', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
}).on('error', err => console.log('Error:', err.message));
