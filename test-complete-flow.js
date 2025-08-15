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

async function testCompleteFlow() {
  console.log('🧪 Testing complete authentication flow...\n');
  
  try {
    // Step 1: Try to access dashboard without auth (should redirect)
    console.log('1️⃣ Testing unauthorized dashboard access...');
    const dashboardResponse = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'accept': 'text/html'
      }
    });
    
    if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 307) {
      console.log('✅ Unauthorized access correctly redirected');
      console.log(`   Redirect status: ${dashboardResponse.statusCode}`);
    } else {
      console.log(`❌ Expected redirect, got status: ${dashboardResponse.statusCode}`);
    }
    
    // Step 2: Sign in via API
    console.log('\n2️⃣ Testing sign-in API...');
    const signInData = JSON.stringify({
      phone: '9171841002',
      pin: '1234'
    });
    
    const signInResponse = await makeRequest({
      hostname: 'localhost',
      port: 9002,
      path: '/api/auth/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': signInData.length
      }
    }, signInData);
    
    if (signInResponse.statusCode === 200) {
      console.log('✅ Sign-in API successful');
      
      // Extract session cookie for next request
      const setCookieHeader = signInResponse.headers['set-cookie'];
      let sessionCookie = '';
      
      if (setCookieHeader) {
        // Find the Supabase auth cookie
        const authCookie = setCookieHeader.find(cookie => 
          cookie.includes('sb-') && cookie.includes('-auth-token=')
        );
        if (authCookie) {
          sessionCookie = authCookie.split(';')[0];
          console.log('✅ Session cookie extracted');
        }
      }
      
      // Step 3: Try to access dashboard with auth cookie
      console.log('\n3️⃣ Testing authorized dashboard access...');
      const authorizedDashboardResponse = await makeRequest({
        hostname: 'localhost',
        port: 9002,
        path: '/dashboard',
        method: 'GET',
        headers: {
          'Cookie': sessionCookie,
          'accept': 'text/html'
        }
      });
      
      if (authorizedDashboardResponse.statusCode === 200) {
        console.log('✅ Authorized dashboard access successful!');
        console.log('   Dashboard page loaded correctly');
      } else if (authorizedDashboardResponse.statusCode === 302 || authorizedDashboardResponse.statusCode === 307) {
        console.log(`❌ Still being redirected with auth cookie: ${authorizedDashboardResponse.statusCode}`);
        console.log('   Location:', authorizedDashboardResponse.headers.location);
      } else {
        console.log(`❌ Unexpected dashboard response: ${authorizedDashboardResponse.statusCode}`);
      }
      
    } else {
      console.log(`❌ Sign-in failed: ${signInResponse.statusCode}`);
      console.log('Response:', signInResponse.body);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  console.log('\n🎯 Authentication flow test completed!');
}

// Wait for server to be ready
setTimeout(() => {
  testCompleteFlow();
}, 5000);

console.log('Waiting 5 seconds for server to be ready...');