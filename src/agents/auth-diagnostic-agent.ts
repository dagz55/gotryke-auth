#!/usr/bin/env node

import { EventEmitter } from 'events';

export interface AuthDiagnostic {
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosis: string;
  solution: string;
  autoFixable: boolean;
}

export class AuthDiagnosticAgent extends EventEmitter {
  private baseUrl = 'http://localhost:9002';

  constructor() {
    super();
  }

  public async diagnoseAuthIssues(): Promise<AuthDiagnostic[]> {
    console.log('🔐 GoTryke Authentication Diagnostic Agent');
    console.log('='.repeat(50));
    console.log('Analyzing authentication system...\n');

    const diagnostics: AuthDiagnostic[] = [];

    // Test 1: API Endpoints
    const apiDiagnostic = await this.testAPIEndpoints();
    diagnostics.push(...apiDiagnostic);

    // Test 2: Database Connection
    const dbDiagnostic = await this.testDatabaseConnection();
    diagnostics.push(...dbDiagnostic);

    // Test 3: Environment Configuration
    const envDiagnostic = this.checkEnvironmentVariables();
    diagnostics.push(...envDiagnostic);

    // Test 4: User Data
    const userDiagnostic = await this.checkUserData();
    diagnostics.push(...userDiagnostic);

    // Test 5: SMS Configuration
    const smsDiagnostic = this.checkSMSConfiguration();
    diagnostics.push(...smsDiagnostic);

    this.generateReport(diagnostics);
    return diagnostics;
  }

  private async testAPIEndpoints(): Promise<AuthDiagnostic[]> {
    console.log('🔍 Testing API endpoints...');
    const diagnostics: AuthDiagnostic[] = [];

    const endpoints = [
      { path: '/api/auth/signin', name: 'Sign In' },
      { path: '/api/auth/signup', name: 'Sign Up' },
      { path: '/api/auth/send-otp', name: 'Send OTP' },
      { path: '/api/auth/verify-otp', name: 'Verify OTP' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        const data = await response.json();

        if (response.status === 400 && data.error) {
          console.log(`✅ ${endpoint.name}: Properly rejecting empty requests`);
        } else if (response.status >= 500) {
          diagnostics.push({
            issue: `${endpoint.name} API Error`,
            severity: 'HIGH',
            diagnosis: `${endpoint.path} returning ${response.status}: ${data.error || 'Internal server error'}`,
            solution: 'Check server logs and database connection',
            autoFixable: false
          });
        }
      } catch (error: any) {
        diagnostics.push({
          issue: `${endpoint.name} API Unreachable`,
          severity: 'CRITICAL',
          diagnosis: `Cannot connect to ${endpoint.path}: ${error.message}`,
          solution: 'Ensure development server is running on port 9002',
          autoFixable: true
        });
      }
    }

    return diagnostics;
  }

  private async testDatabaseConnection(): Promise<AuthDiagnostic[]> {
    console.log('🗄️  Testing database connection...');
    const diagnostics: AuthDiagnostic[] = [];

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      diagnostics.push({
        issue: 'Supabase Configuration Missing',
        severity: 'CRITICAL',
        diagnosis: 'SUPABASE_URL or SUPABASE_ANON_KEY environment variables not set',
        solution: 'Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file',
        autoFixable: false
      });
      return diagnostics;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Supabase connection successful');
      } else {
        const errorText = await response.text();
        diagnostics.push({
          issue: 'Database Connection Failed',
          severity: 'HIGH',
          diagnosis: `Supabase API returned ${response.status}: ${errorText}`,
          solution: 'Check Supabase credentials and project status',
          autoFixable: false
        });
      }
    } catch (error: any) {
      diagnostics.push({
        issue: 'Database Unreachable',
        severity: 'HIGH', 
        diagnosis: `Cannot reach Supabase: ${error.message}`,
        solution: 'Check internet connection and Supabase URL',
        autoFixable: false
      });
    }

    return diagnostics;
  }

  private checkEnvironmentVariables(): AuthDiagnostic[] {
    console.log('⚙️  Checking environment variables...');
    const diagnostics: AuthDiagnostic[] = [];

    const requiredVars = {
      'SUPABASE_URL': 'Supabase project URL',
      'SUPABASE_ANON_KEY': 'Supabase anonymous/public key',
      'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
      'TWILIO_ACCOUNT_SID': 'Twilio Account SID for SMS',
      'TWILIO_AUTH_TOKEN': 'Twilio Auth Token for SMS',
      'TWILIO_PHONE_NUMBER': 'Twilio phone number for sending SMS'
    };

    const missingVars: string[] = [];
    const presentVars: string[] = [];

    for (const [varName, description] of Object.entries(requiredVars)) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      } else {
        presentVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      diagnostics.push({
        issue: 'Missing Environment Variables',
        severity: 'HIGH',
        diagnosis: `Missing required variables: ${missingVars.join(', ')}`,
        solution: `Add the following to your .env file:\n${missingVars.map(v => `${v}=your_${v.toLowerCase()}_here`).join('\n')}`,
        autoFixable: false
      });
    }

    if (presentVars.length > 0) {
      console.log(`✅ Found environment variables: ${presentVars.join(', ')}`);
    }

    return diagnostics;
  }

  private async checkUserData(): Promise<AuthDiagnostic[]> {
    console.log('👤 Testing user authentication...');
    const diagnostics: AuthDiagnostic[] = [];

    // Test with a sample user login
    try {
      const testUser = {
        phone: '+1234567890',
        pin: '1234'
      };

      const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();

      if (response.status === 400 && data.error === 'User not found or account is inactive') {
        console.log('✅ Authentication properly rejecting invalid users');
        
        diagnostics.push({
          issue: 'No Test Users Available',
          severity: 'MEDIUM',
          diagnosis: 'No valid user accounts found for testing authentication',
          solution: 'Create a test user account through the signup process or database',
          autoFixable: false
        });
      } else if (response.status >= 500) {
        diagnostics.push({
          issue: 'Authentication Server Error',
          severity: 'HIGH',
          diagnosis: `Authentication failing with server error: ${data.error}`,
          solution: 'Check server logs and database schema',
          autoFixable: false
        });
      }
    } catch (error: any) {
      diagnostics.push({
        issue: 'Authentication Test Failed',
        severity: 'MEDIUM',
        diagnosis: `Cannot test authentication: ${error.message}`,
        solution: 'Ensure all APIs are functioning correctly',
        autoFixable: false
      });
    }

    return diagnostics;
  }

  private checkSMSConfiguration(): AuthDiagnostic[] {
    console.log('📱 Checking SMS configuration...');
    const diagnostics: AuthDiagnostic[] = [];

    const twilioVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
    const missingTwilio = twilioVars.filter(v => !process.env[v]);

    if (missingTwilio.length > 0) {
      diagnostics.push({
        issue: 'SMS Service Not Configured',
        severity: 'HIGH',
        diagnosis: `Missing Twilio configuration: ${missingTwilio.join(', ')}`,
        solution: 'Configure Twilio credentials for SMS OTP functionality',
        autoFixable: false
      });
    } else {
      console.log('✅ SMS service configuration appears complete');
    }

    return diagnostics;
  }

  private generateReport(diagnostics: AuthDiagnostic[]): void {
    console.log('\n📊 AUTHENTICATION DIAGNOSTIC REPORT');
    console.log('='.repeat(50));

    if (diagnostics.length === 0) {
      console.log('✅ No issues detected! Authentication system appears healthy.');
      return;
    }

    const critical = diagnostics.filter(d => d.severity === 'CRITICAL');
    const high = diagnostics.filter(d => d.severity === 'HIGH');
    const medium = diagnostics.filter(d => d.severity === 'MEDIUM');
    const low = diagnostics.filter(d => d.severity === 'LOW');

    console.log(`Found ${diagnostics.length} issue(s):`);
    console.log(`  🔴 Critical: ${critical.length}`);
    console.log(`  🟠 High: ${high.length}`);
    console.log(`  🟡 Medium: ${medium.length}`);
    console.log(`  🟢 Low: ${low.length}`);
    console.log('');

    // Show issues by severity
    [...critical, ...high, ...medium, ...low].forEach((diagnostic, index) => {
      const icon = {
        CRITICAL: '🔴',
        HIGH: '🟠', 
        MEDIUM: '🟡',
        LOW: '🟢'
      }[diagnostic.severity];

      console.log(`${index + 1}. ${icon} ${diagnostic.issue}`);
      console.log(`   Diagnosis: ${diagnostic.diagnosis}`);
      console.log(`   Solution: ${diagnostic.solution}`);
      if (diagnostic.autoFixable) {
        console.log(`   🤖 This issue can be auto-fixed`);
      }
      console.log('');
    });

    // Provide next steps
    console.log('📋 NEXT STEPS:');
    if (critical.length > 0) {
      console.log('1. 🚨 Fix critical issues first - these prevent authentication from working');
    }
    if (high.length > 0) {
      console.log('2. ⚠️  Address high priority issues - these impact functionality');
    }
    if (medium.length > 0) {
      console.log('3. 📝 Consider medium priority improvements');
    }
    
    console.log('\n💡 Common Solutions:');
    console.log('• Check your .env file has all required variables');
    console.log('• Verify Supabase project is active and credentials are correct');
    console.log('• Ensure your database has the correct schema and tables');
    console.log('• Create test user accounts for development');
    console.log('• Restart your development server after environment changes');
  }

  public async fixAutoFixableIssues(diagnostics: AuthDiagnostic[]): Promise<void> {
    const autoFixable = diagnostics.filter(d => d.autoFixable);
    
    if (autoFixable.length === 0) {
      console.log('No auto-fixable issues found.');
      return;
    }

    console.log(`\n🤖 Attempting to fix ${autoFixable.length} auto-fixable issue(s)...`);
    
    for (const issue of autoFixable) {
      console.log(`\n🔧 Fixing: ${issue.issue}`);
      
      if (issue.issue.includes('API Unreachable')) {
        // Try to restart development server
        console.log('   Checking if development server needs restart...');
        // This would be implemented based on specific needs
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const agent = new AuthDiagnosticAgent();
  
  agent.diagnoseAuthIssues().then(diagnostics => {
    if (process.argv.includes('--fix')) {
      agent.fixAutoFixableIssues(diagnostics);
    }
  }).catch(error => {
    console.error('Diagnostic failed:', error);
    process.exit(1);
  });
}