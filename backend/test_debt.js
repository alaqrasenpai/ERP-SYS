const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/pos/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': 'alaqrasenpai/ERP-SYS' // wait, what is the user's active tenant? "alaqrasenpai/ERP-SYS" was mentioned earlier in user info. Let's use it.
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nBody: ${data}`));
});

req.write(JSON.stringify({
  items: [{ productId: '64d1f2a3e4b5c6d7e8f9a0b1', name: 'Test Item', quantity: 1, price: 10, costPrice: 5 }],
  subTotal: 10, discount: 0, tax: 0, grandTotal: 10,
  paymentMethod: 'Debt',
  customerId: '64d1f2a3e4b5c6d7e8f9a0b2'
}));
req.end();
