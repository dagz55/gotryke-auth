#!/usr/bin/env node

const http = require('http');

// Test the signin API directly
function testSigninAPI() {
  const data = JSON.stringify({
    phone: '9171841002',
    pin: '1234'
  });

  const options = {
    hostname: 'localhost',
    port: 9002,
    path: '/api/auth/signin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🔐 Testing signin API...');
  console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('Data:', data);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      console.log('Response:', responseBody);
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed.success) {
          console.log('✅ Login successful!');
          console.log('  User:', parsed.user);
        } else {
          console.log('❌ Login failed:', parsed.error);
        }
      } catch (e) {
        console.log('❌ Response parsing error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(data);
  req.end();
}

// Test with a delay to ensure server is up
setTimeout(() => {
  testSigninAPI();
}, 2000);

console.log('Waiting 2 seconds for server to be ready...');