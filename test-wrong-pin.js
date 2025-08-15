#!/usr/bin/env node

const http = require('http');

// Test the signin API with wrong PIN
function testWrongPin() {
  const data = JSON.stringify({
    phone: '9171841002',
    pin: '9999' // Wrong PIN
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

  console.log('🔐 Testing signin API with wrong PIN...');

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      console.log('Response:', responseBody);
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed.success) {
          console.log('❌ SECURITY ISSUE: Wrong PIN was accepted!');
        } else {
          console.log('✅ Correctly rejected wrong PIN:', parsed.error);
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

testWrongPin();