#!/usr/bin/env node

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testMiddleware() {
  console.log('🔧 Testing middleware behavior...\n');
  
  try {
    // Test with no authentication
    console.log('1️⃣ Testing dashboard access without auth...');
    const response1 = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/dashboard',
      method: 'GET'
    });
    
    console.log(`Status: ${response1.statusCode}`);
    console.log(`Headers:`, Object.keys(response1.headers));
    console.log(`Has Location header:`, !!response1.headers.location);
    if (response1.headers.location) {
      console.log(`Redirect to: ${response1.headers.location}`);
    }
    
    // Check if response is HTML content or redirect
    if (response1.body.includes('<html') || response1.body.includes('<!DOCTYPE')) {
      console.log('❌ Received HTML page instead of redirect - middleware may not be working');
    } else if (response1.statusCode >= 300 && response1.statusCode < 400) {
      console.log('✅ Properly redirecting unauthorized access');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Wait for server to be ready
setTimeout(() => {
  testMiddleware();
}, 3000);

console.log('Waiting 3 seconds for server to be ready...');