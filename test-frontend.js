#!/usr/bin/env node

const http = require('http');

// Test the full frontend flow - get the login page first
function testFrontendFlow() {
  console.log('🌐 Testing frontend login flow...');
  
  // First, try to access the login page
  const options = {
    hostname: 'localhost',
    port: 9002,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Login page status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Login page accessible');
      console.log('Now testing the signin API flow...');
      
      // Test the signin API
      testSigninAPI();
    } else {
      console.log(`❌ Login page not accessible: ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    console.error('❌ Login page request error:', e.message);
  });

  req.end();
}

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

  const req = http.request(options, (res) => {
    console.log(`Signin API status: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed.success) {
          console.log('✅ Signin API working - Login should redirect to dashboard');
          console.log('  Session cookie should be set:', res.headers['set-cookie'] ? 'YES' : 'NO');
        } else {
          console.log('❌ Signin API failed:', parsed.error);
        }
      } catch (e) {
        console.log('❌ Response parsing error:', e.message);
        console.log('Raw response:', responseBody);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Signin API request error:', e.message);
  });

  req.write(data);
  req.end();
}

// Wait a moment for server to be ready
setTimeout(() => {
  testFrontendFlow();
}, 3000);

console.log('Waiting 3 seconds for server to be ready...');