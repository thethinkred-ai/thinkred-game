import * as http from 'http';

const req = http.request({hostname: 'localhost', port: 3001, path: '/auth/dev-login', method: 'GET'}, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Body:', data.substring(0, 300));
    const loc = res.headers.location || '';
    console.log('Location header:', loc);
    if (loc.includes('token=')) {
      const token = loc.split('token=')[1];
      console.log('Token length:', token.length);
    }
  });
});
req.on('error', (e) => console.log('Error:', e.message));
req.end();
