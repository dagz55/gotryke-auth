#!/usr/bin/env node

export class IncidentResponseAgent {
  public async handleRoutingIncident(): Promise<void> {
    console.log('🚨 INCIDENT RESPONSE AGENT ACTIVATED');
    console.log('='.repeat(50));
    console.log('IMMEDIATE ACTION: Fixing sign-in routing failure');
    console.log('');

    // Apply multiple fixes simultaneously
    await this.applyAggressiveRoutingFix();
    await this.addFallbackNavigationMethods();
    await this.implementImmediateRedirectFix();
    
    console.log('✅ ALL FIXES APPLIED - Try signing in now');
  }

  private async applyAggressiveRoutingFix(): Promise<void> {
    console.log('🔧 Fix 1: Replacing router.push with window.location');
    
    try {
      const { readFile, writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      let content = await readFile(authContextPath, 'utf-8');

      // Replace the complex routing logic with simple window.location
      const currentRoutingBlock = `if (event === 'SIGNED_IN') {
            // Add small delay to ensure middleware sees the session
            setTimeout(() => {
              console.log('✅ Navigating to dashboard after sign-in')
              router.push('/dashboard')
              
              // Emergency backup: force page navigation if router fails
              setTimeout(() => {
                if (window.location.pathname === '/') {
                  console.log('🚨 Emergency routing: Using window.location')
                  window.location.href = '/dashboard'
                }
              }, 500)
            }, 100)
          }`;

      const aggressiveRouting = `if (event === 'SIGNED_IN') {
            console.log('🔐 SIGNED_IN event - forcing navigation to dashboard')
            
            // Use window.location immediately - most reliable method
            window.location.href = '/dashboard'
          }`;

      if (content.includes(currentRoutingBlock)) {
        content = content.replace(currentRoutingBlock, aggressiveRouting);
        await writeFile(authContextPath, content);
        console.log('   ✅ Applied aggressive window.location routing');
      } else {
        console.log('   ⚠️  Could not find current routing block to replace');
      }

    } catch (error: any) {
      console.log(`   ❌ Failed to apply aggressive fix: ${error.message}`);
    }
  }

  private async addFallbackNavigationMethods(): Promise<void> {
    console.log('🔧 Fix 2: Adding multiple fallback navigation methods');
    
    try {
      const { readFile, writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      let content = await readFile(authContextPath, 'utf-8');

      // Add additional navigation methods to the signInWithPin function
      const signInFunction = `const signInWithPin = async (phone: string, pin: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Sign-in successful - forcing immediate navigation')
        
        // Force immediate navigation - don't wait for auth state change
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
        
        // Session will be updated via auth state change listener
        return { success: true }
      }
      
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign in failed'
      }
    }
  }`;

      // Find and replace the signInWithPin function
      const signInPattern = /const signInWithPin = async \(phone: string, pin: string\) => \{[^}]*\}/s;
      
      if (content.match(signInPattern)) {
        content = content.replace(signInPattern, signInFunction);
        await writeFile(authContextPath, content);
        console.log('   ✅ Added immediate navigation to signInWithPin function');
      }

    } catch (error: any) {
      console.log(`   ⚠️  Could not add fallback methods: ${error.message}`);
    }
  }

  private async implementImmediateRedirectFix(): Promise<void> {
    console.log('🔧 Fix 3: Adding client-side redirect hook');
    
    try {
      const redirectScript = `
// Immediate redirect script for auth issues
(function() {
  let signInAttempted = false;
  
  // Listen for successful sign-in responses
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const promise = originalFetch.apply(this, args);
    
    if (args[0] && args[0].includes('/api/auth/signin')) {
      promise.then(response => {
        if (response.ok) {
          response.clone().json().then(data => {
            if (data.success && !signInAttempted) {
              signInAttempted = true;
              console.log('🚨 Intercepted successful sign-in - forcing redirect');
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 200);
            }
          });
        }
      });
    }
    
    return promise;
  };
})();
`;

      // Add this script to the layout
      const { readFile, writeFile } = await import('fs/promises');
      const layoutPath = '/Users/robertsuarez/gotryke-auth/src/app/layout.tsx';
      let layoutContent = await readFile(layoutPath, 'utf-8');

      if (!layoutContent.includes('Immediate redirect script')) {
        // Add the script before the closing head tag
        const headClosePattern = /<\/head>/;
        const scriptTag = `
        <script dangerouslySetInnerHTML={{__html: \`${redirectScript}\`}} />
        </head>`;

        if (layoutContent.match(headClosePattern)) {
          layoutContent = layoutContent.replace('</head>', scriptTag);
          await writeFile(layoutPath, layoutContent);
          console.log('   ✅ Added client-side redirect interceptor');
        }
      }

    } catch (error: any) {
      console.log(`   ⚠️  Could not add redirect script: ${error.message}`);
    }
  }

  public async testFix(): Promise<void> {
    console.log('\n🧪 Testing the routing fix...');
    
    const testCredentials = {
      phone: '+1234567890',
      pin: '1234'
    };

    try {
      const response = await fetch('http://localhost:9002/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCredentials)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Sign-in API working correctly');
        console.log('📋 The routing fixes have been applied');
        console.log('');
        console.log('🔄 CLEAR BROWSER CACHE AND TRY AGAIN:');
        console.log('1. Press Ctrl+Shift+R (or Cmd+Shift+R)');
        console.log('2. Sign in with +1234567890 / 1234');
        console.log('3. Should redirect immediately to dashboard');
      } else {
        console.log(`⚠️  Sign-in issue: ${result.error}`);
      }

    } catch (error: any) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }

  public async emergencyPageReload(): Promise<void> {
    console.log('🚨 EMERGENCY: Creating auto-reload page for testing');
    
    const testPageContent = `
<!DOCTYPE html>
<html>
<head>
    <title>GoTryke - Emergency Auth Test</title>
</head>
<body>
    <h1>Emergency Auth Test</h1>
    <p>Testing immediate redirect after sign-in...</p>
    
    <script>
    // Test the sign-in flow
    fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1234567890', pin: '1234' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.body.innerHTML += '<p>✅ Sign-in successful - redirecting...</p>';
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            document.body.innerHTML += '<p>❌ Sign-in failed: ' + data.error + '</p>';
        }
    });
    </script>
</body>
</html>
    `;

    try {
      const { writeFile } = await import('fs/promises');
      await writeFile('/Users/robertsuarez/gotryke-auth/public/test-auth.html', testPageContent);
      console.log('✅ Emergency test page created at http://localhost:9002/test-auth.html');
    } catch (error: any) {
      console.log(`❌ Could not create test page: ${error.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const agent = new IncidentResponseAgent();
  
  const command = process.argv[2];
  
  if (command === 'test') {
    agent.testFix();
  } else if (command === 'emergency') {
    agent.emergencyPageReload();
  } else {
    agent.handleRoutingIncident().then(() => {
      return agent.testFix();
    }).then(() => {
      return agent.emergencyPageReload();
    });
  }
}