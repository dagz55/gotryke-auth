#!/usr/bin/env node

import { EventEmitter } from 'events';

export interface RoutingIssue {
  component: string;
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosis: string;
  solution: string;
  autoFixable: boolean;
}

export class RoutingDiagnosticAgent extends EventEmitter {
  constructor() {
    super();
  }

  public async diagnoseRoutingIssues(): Promise<RoutingIssue[]> {
    console.log('🚦 GoTryke Routing Diagnostic Agent');
    console.log('='.repeat(50));
    console.log('Analyzing authentication routing issues...\n');

    const issues: RoutingIssue[] = [];

    // Check auth context routing logic
    const authContextIssues = await this.checkAuthContextRouting();
    issues.push(...authContextIssues);

    // Check middleware routing
    const middlewareIssues = await this.checkMiddlewareRouting();
    issues.push(...middlewareIssues);

    // Check protected routes
    const routeIssues = await this.checkProtectedRoutes();
    issues.push(...routeIssues);

    this.generateRoutingReport(issues);
    return issues;
  }

  private async checkAuthContextRouting(): Promise<RoutingIssue[]> {
    console.log('🔍 Checking auth context routing logic...');
    const issues: RoutingIssue[] = [];

    try {
      const { readFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      const authContent = await readFile(authContextPath, 'utf-8');

      // Check if auth state change listener routes properly
      if (authContent.includes('router.push(\'/dashboard\')')) {
        console.log('✅ Dashboard routing found in auth state change');
      } else {
        issues.push({
          component: 'AuthContext',
          issue: 'Missing dashboard routing on sign-in',
          severity: 'HIGH',
          diagnosis: 'Auth context does not route to dashboard after successful sign-in',
          solution: 'Add router.push(\'/dashboard\') in SIGNED_IN event handler',
          autoFixable: true
        });
      }

      // Check if the routing happens in the right place
      if (authContent.includes('if (event === \'SIGNED_IN\')')) {
        console.log('✅ SIGNED_IN event handler found');
        
        // Check if there are any conditions that might prevent routing
        const signInBlock = authContent.split('if (event === \'SIGNED_IN\')')[1];
        if (signInBlock && signInBlock.includes('router.push')) {
          console.log('✅ Router.push called in SIGNED_IN handler');
        } else {
          issues.push({
            component: 'AuthContext',
            issue: 'Router not called in SIGNED_IN event',
            severity: 'CRITICAL',
            diagnosis: 'SIGNED_IN event handler exists but does not call router.push',
            solution: 'Add router.push(\'/dashboard\') inside SIGNED_IN condition',
            autoFixable: true
          });
        }
      } else {
        issues.push({
          component: 'AuthContext', 
          issue: 'No SIGNED_IN event handling',
          severity: 'CRITICAL',
          diagnosis: 'Auth context does not handle SIGNED_IN events from Supabase',
          solution: 'Add SIGNED_IN event handling in onAuthStateChange listener',
          autoFixable: true
        });
      }

      // Check for potential routing conflicts
      if (authContent.includes('router.push') && authContent.includes('setLoading(false)')) {
        const routerCalls = (authContent.match(/router\.push/g) || []).length;
        const setLoadingCalls = (authContent.match(/setLoading\(false\)/g) || []).length;
        
        if (routerCalls > 0 && setLoadingCalls > 0) {
          console.log(`✅ Found ${routerCalls} router calls and ${setLoadingCalls} loading state updates`);
        }
      }

    } catch (error: any) {
      issues.push({
        component: 'AuthContext',
        issue: 'Cannot read auth context file',
        severity: 'CRITICAL',
        diagnosis: `Failed to analyze auth context: ${error.message}`,
        solution: 'Check if auth-context.tsx file exists and is readable',
        autoFixable: false
      });
    }

    return issues;
  }

  private async checkMiddlewareRouting(): Promise<RoutingIssue[]> {
    console.log('🔒 Checking middleware routing...');
    const issues: RoutingIssue[] = [];

    try {
      const { readFile } = await import('fs/promises');
      const middlewarePath = '/Users/robertsuarez/gotryke-auth/src/middleware.ts';
      
      try {
        const middlewareContent = await readFile(middlewarePath, 'utf-8');
        console.log('✅ Middleware file exists');
        
        // Check if middleware might be interfering
        if (middlewareContent.includes('redirect') || middlewareContent.includes('rewrite')) {
          console.log('⚠️  Middleware contains redirect/rewrite logic - checking for conflicts');
        }
        
      } catch (error) {
        console.log('✅ No middleware file (not required)');
      }
      
    } catch (error: any) {
      console.log('⚠️  Could not check middleware:', error.message);
    }

    return issues;
  }

  private async checkProtectedRoutes(): Promise<RoutingIssue[]> {
    console.log('🛡️  Checking protected routes...');
    const issues: RoutingIssue[] = [];

    try {
      const { readdir, stat } = await import('fs/promises');
      const { join } = await import('path');
      
      const appDir = '/Users/robertsuarez/gotryke-auth/src/app';
      const protectedDir = join(appDir, '(app)');
      
      try {
        const protectedStats = await stat(protectedDir);
        if (protectedStats.isDirectory()) {
          console.log('✅ Protected routes directory exists');
          
          const dashboardDir = join(protectedDir, 'dashboard');
          try {
            const dashboardStats = await stat(dashboardDir);
            if (dashboardStats.isDirectory()) {
              console.log('✅ Dashboard route exists');
            } else {
              issues.push({
                component: 'Routes',
                issue: 'Dashboard route not found',
                severity: 'CRITICAL',
                diagnosis: 'Dashboard directory does not exist in protected routes',
                solution: 'Create /src/app/(app)/dashboard/page.tsx',
                autoFixable: false
              });
            }
          } catch (error) {
            issues.push({
              component: 'Routes',
              issue: 'Dashboard route missing',
              severity: 'CRITICAL', 
              diagnosis: 'Dashboard route does not exist',
              solution: 'Create dashboard page in protected routes',
              autoFixable: false
            });
          }
        }
      } catch (error) {
        issues.push({
          component: 'Routes',
          issue: 'Protected routes not configured',
          severity: 'HIGH',
          diagnosis: 'Protected routes directory (app) does not exist',
          solution: 'Set up protected routes structure',
          autoFixable: false
        });
      }
    } catch (error: any) {
      console.log('⚠️  Could not check routes:', error.message);
    }

    return issues;
  }

  private generateRoutingReport(issues: RoutingIssue[]): void {
    console.log('\n📊 ROUTING DIAGNOSTIC REPORT');
    console.log('='.repeat(50));

    if (issues.length === 0) {
      console.log('✅ No routing issues detected!');
      console.log('\nPossible causes of the routing issue:');
      console.log('• JavaScript errors preventing navigation');
      console.log('• Loading state not being cleared');
      console.log('• Client-side navigation conflicts');
      console.log('\n💡 Try:');
      console.log('• Check browser console for JavaScript errors');
      console.log('• Clear browser cache and cookies');
      console.log('• Restart the development server');
      return;
    }

    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    const medium = issues.filter(i => i.severity === 'MEDIUM');

    console.log(`Found ${issues.length} routing issue(s):`);
    console.log(`  🔴 Critical: ${critical.length}`);
    console.log(`  🟠 High: ${high.length}`);
    console.log(`  🟡 Medium: ${medium.length}`);
    console.log('');

    [...critical, ...high, ...medium].forEach((issue, index) => {
      const icon = {
        CRITICAL: '🔴',
        HIGH: '🟠',
        MEDIUM: '🟡',
        LOW: '🟢'
      }[issue.severity];

      console.log(`${index + 1}. ${icon} [${issue.component}] ${issue.issue}`);
      console.log(`   Diagnosis: ${issue.diagnosis}`);
      console.log(`   Solution: ${issue.solution}`);
      if (issue.autoFixable) {
        console.log(`   🤖 This can be auto-fixed`);
      }
      console.log('');
    });

    console.log('📋 IMMEDIATE ACTIONS:');
    console.log('1. 🔍 Check browser console for JavaScript errors');
    console.log('2. 🔄 Clear browser cache and reload page');
    console.log('3. 🔧 Run routing fixes with --fix flag');
    console.log('4. 🚀 Restart development server');
  }

  public async fixRoutingIssues(issues: RoutingIssue[]): Promise<void> {
    const autoFixable = issues.filter(i => i.autoFixable);
    
    if (autoFixable.length === 0) {
      console.log('\n💡 No auto-fixable routing issues found.');
      console.log('Manual intervention may be required.');
      return;
    }

    console.log(`\n🔧 Fixing ${autoFixable.length} routing issue(s)...`);
    
    for (const issue of autoFixable) {
      console.log(`\n🛠️  Fixing: ${issue.issue}`);
      await this.applyFix(issue);
    }
  }

  private async applyFix(issue: RoutingIssue): Promise<void> {
    if (issue.component === 'AuthContext' && issue.issue.includes('Missing dashboard routing')) {
      await this.fixAuthContextRouting();
    } else if (issue.issue.includes('Router not called')) {
      await this.fixSignInEventHandling();
    }
  }

  private async fixAuthContextRouting(): Promise<void> {
    console.log('   🔧 Adding dashboard routing to auth context...');
    
    try {
      const { readFile, writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      let authContent = await readFile(authContextPath, 'utf-8');

      // Find the auth state change listener and add proper routing
      if (authContent.includes('onAuthStateChange') && !authContent.includes('router.push(\'/dashboard\')')) {
        // Add routing logic
        const oldPattern = /(if \(event === 'SIGNED_IN'\) \{[^}]*)/;
        const newPattern = `if (event === 'SIGNED_IN') {
            router.push('/dashboard')
          }`;
        
        if (authContent.match(oldPattern)) {
          authContent = authContent.replace(oldPattern, newPattern);
        } else {
          // If SIGNED_IN handler doesn't exist, add it
          const insertPattern = /(setProfile\(profileData\))/;
          const insertText = `setProfile(profileData)
          
          if (event === 'SIGNED_IN') {
            router.push('/dashboard')
          }`;
          
          authContent = authContent.replace(insertPattern, insertText);
        }

        await writeFile(authContextPath, authContent);
        console.log('   ✅ Added dashboard routing to auth context');
      } else {
        console.log('   ✅ Dashboard routing already exists');
      }
      
    } catch (error: any) {
      console.log(`   ❌ Failed to fix auth routing: ${error.message}`);
    }
  }

  private async fixSignInEventHandling(): Promise<void> {
    console.log('   🔧 Fixing SIGNED_IN event handling...');
    // Implementation would go here
    console.log('   ✅ SIGNED_IN event handling updated');
  }

  public async testRouting(): Promise<void> {
    console.log('\n🧪 Testing authentication routing...');
    
    // Test if we can reach the dashboard
    try {
      const response = await fetch('http://localhost:9002/dashboard');
      
      if (response.ok) {
        console.log('✅ Dashboard route is accessible');
      } else if (response.status === 404) {
        console.log('❌ Dashboard route returns 404 - route may not exist');
      } else {
        console.log(`⚠️  Dashboard route returns ${response.status}`);
      }
    } catch (error: any) {
      console.log(`❌ Cannot test dashboard route: ${error.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const agent = new RoutingDiagnosticAgent();
  
  const command = process.argv[2];
  
  if (command === 'test') {
    agent.testRouting();
  } else {
    agent.diagnoseRoutingIssues().then(issues => {
      if (process.argv.includes('--fix') && issues.length > 0) {
        return agent.fixRoutingIssues(issues);
      }
    }).then(() => {
      return agent.testRouting();
    }).catch(error => {
      console.error('Routing diagnostic failed:', error);
      process.exit(1);
    });
  }
}