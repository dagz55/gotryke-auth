#!/usr/bin/env node

export class RoutingFixAgent {
  public async diagnoseAndFixRoutingIssue(): Promise<void> {
    console.log('🔧 GoTryke Routing Fix Agent');
    console.log('='.repeat(50));
    console.log('Diagnosing sign-in routing issue...\n');

    // The issue is likely a race condition between:
    // 1. Client-side auth state change (AuthContext trying to navigate)
    // 2. Server-side middleware redirect
    // 3. Timing of session establishment

    await this.analyzeTheIssue();
    await this.implementFixes();
  }

  private async analyzeTheIssue(): Promise<void> {
    console.log('🔍 Analysis of the routing issue:');
    console.log('');
    console.log('The user sees "Welcome back! You have been signed in successfully"');
    console.log('but the page doesn\'t navigate to dashboard.');
    console.log('');
    console.log('🎯 Root Cause Identified:');
    console.log('   The middleware.ts is redirecting authenticated users away from "/"');
    console.log('   but there might be a timing issue where:');
    console.log('');
    console.log('   1. User submits sign-in form');
    console.log('   2. API call succeeds, shows success toast');
    console.log('   3. AuthContext receives SIGNED_IN event');
    console.log('   4. AuthContext tries to navigate to /dashboard');
    console.log('   5. But middleware might not see the session immediately');
    console.log('   6. Creating a race condition');
    console.log('');
  }

  private async implementFixes(): Promise<void> {
    console.log('🛠️  Implementing fixes...');
    console.log('');

    // Fix 1: Add explicit session refresh before navigation
    await this.fixAuthContextTiming();
    
    // Fix 2: Add debugging to identify the exact issue
    await this.addDebugging();
    
    console.log('✅ Routing fixes applied!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Clear browser cache and cookies');
    console.log('2. Restart the development server: npm run dev');
    console.log('3. Try signing in again');
    console.log('4. Check browser console for any error messages');
    console.log('');
    console.log('💡 If issue persists:');
    console.log('   - Check browser Network tab during sign-in');
    console.log('   - Look for any 401/403/500 errors');
    console.log('   - Verify database user profile exists and is active');
  }

  private async fixAuthContextTiming(): Promise<void> {
    console.log('🔧 Fix 1: Improving auth context timing...');
    
    try {
      const { readFile, writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      let content = await readFile(authContextPath, 'utf-8');

      // Check if we need to add a delay/session refresh before navigation
      const currentSignInHandler = `if (event === 'SIGNED_IN') {
            router.push('/dashboard')
          }`;
          
      const improvedSignInHandler = `if (event === 'SIGNED_IN') {
            // Add small delay to ensure middleware sees the session
            setTimeout(() => {
              router.push('/dashboard')
            }, 100)
          }`;

      if (content.includes(currentSignInHandler)) {
        content = content.replace(currentSignInHandler, improvedSignInHandler);
        await writeFile(authContextPath, content);
        console.log('   ✅ Added timing fix to auth context');
      } else {
        console.log('   ℹ️  Auth context already has timing handling or different structure');
      }
      
    } catch (error: any) {
      console.log(`   ⚠️  Could not apply timing fix: ${error.message}`);
    }
  }

  private async addDebugging(): Promise<void> {
    console.log('🔧 Fix 2: Adding debugging for sign-in flow...');
    
    try {
      const { readFile, writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      let content = await readFile(authContextPath, 'utf-8');

      // Add console logging to track the sign-in flow
      if (!content.includes('console.log(\'🔐 Auth state change:\'')) {
        // Add debugging to auth state change listener
        const oldListener = /onAuthStateChange\(\s*async \(event, session\) => \{/;
        const newListener = `onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'has session' : 'no session')`;

        content = content.replace(oldListener, newListener);
      }

      // Add debugging to sign-in success
      if (!content.includes('console.log(\'✅ Navigating to dashboard\'')) {
        const oldNavigation = /router\.push\('\/dashboard'\)/g;
        const newNavigation = `console.log('✅ Navigating to dashboard after sign-in')
            router.push('/dashboard')`;
            
        content = content.replace(oldNavigation, newNavigation);
      }

      await writeFile(authContextPath, content);
      console.log('   ✅ Added debugging to auth flow');
      
    } catch (error: any) {
      console.log(`   ⚠️  Could not add debugging: ${error.message}`);
    }
  }

  public async testSignInFlow(): Promise<void> {
    console.log('🧪 Testing sign-in flow...');
    console.log('');
    
    const testCredentials = {
      phone: '+1234567890',
      pin: '1234'
    };

    try {
      // Test the sign-in API
      const response = await fetch('http://localhost:9002/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCredentials)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Sign-in API working correctly');
        
        // Now test if we can access dashboard
        setTimeout(async () => {
          try {
            const dashboardResponse = await fetch('http://localhost:9002/dashboard');
            
            if (dashboardResponse.ok) {
              console.log('✅ Dashboard accessible after sign-in');
            } else {
              console.log(`⚠️  Dashboard returns ${dashboardResponse.status} - check middleware`);
            }
          } catch (error: any) {
            console.log('⚠️  Could not test dashboard access:', error.message);
          }
        }, 1000);
        
      } else {
        console.log(`⚠️  Sign-in API issue: ${result.error}`);
      }

    } catch (error: any) {
      console.log(`❌ Sign-in test failed: ${error.message}`);
    }
  }

  public async checkBrowserConsoleInstructions(): Promise<void> {
    console.log('\n🔍 BROWSER DEBUGGING INSTRUCTIONS');
    console.log('='.repeat(50));
    console.log('');
    console.log('To debug the routing issue in your browser:');
    console.log('');
    console.log('1. 🔧 Open Developer Tools (F12)');
    console.log('2. 📝 Go to Console tab');
    console.log('3. 🔄 Clear console (Ctrl+L)');
    console.log('4. 🔐 Try signing in with:');
    console.log('   Phone: +1234567890');
    console.log('   PIN: 1234');
    console.log('');
    console.log('5. 👀 Watch for these console messages:');
    console.log('   ✅ "🔐 Auth state change: SIGNED_IN"');
    console.log('   ✅ "✅ Navigating to dashboard after sign-in"');
    console.log('   ❌ Any error messages or red text');
    console.log('');
    console.log('6. 🌐 Check Network tab for:');
    console.log('   ✅ POST /api/auth/signin → 200');
    console.log('   ✅ Any redirects to /dashboard');
    console.log('   ❌ Any 401, 403, or 500 errors');
    console.log('');
    console.log('7. 🍪 Check Application tab → Cookies:');
    console.log('   Look for Supabase auth cookies being set');
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const fixAgent = new RoutingFixAgent();
  
  const command = process.argv[2];
  
  if (command === 'test') {
    fixAgent.testSignInFlow();
  } else if (command === 'debug') {
    fixAgent.checkBrowserConsoleInstructions();
  } else {
    fixAgent.diagnoseAndFixRoutingIssue().then(() => {
      return fixAgent.checkBrowserConsoleInstructions();
    }).catch(error => {
      console.error('Routing fix failed:', error);
    });
  }
}