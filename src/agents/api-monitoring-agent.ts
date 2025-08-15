#!/usr/bin/env node

import { EventEmitter } from 'events';
import { ProjectManager } from './project-manager';
import { Incident } from './monitoring-agent';

export interface APIHealthCheck {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus?: number;
  testPayload?: any;
  headers?: Record<string, string>;
}

export class APIMonitoringAgent extends EventEmitter {
  private isMonitoring = false;
  private projectManager: ProjectManager;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private baseUrl = 'http://localhost:9002';

  private apiEndpoints: APIHealthCheck[] = [
    {
      endpoint: '/api/auth/signin',
      method: 'POST',
      expectedStatus: 400, // Expecting 400 for empty payload test
      testPayload: {}, // Empty to test validation
      headers: { 'Content-Type': 'application/json' }
    },
    {
      endpoint: '/api/auth/send-otp', 
      method: 'POST',
      expectedStatus: 400,
      testPayload: {},
      headers: { 'Content-Type': 'application/json' }
    },
    {
      endpoint: '/api/auth/verify-otp',
      method: 'POST', 
      expectedStatus: 400,
      testPayload: {},
      headers: { 'Content-Type': 'application/json' }
    }
  ];

  constructor() {
    super();
    this.projectManager = new ProjectManager();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.projectManager.on('human_escalation', (report) => {
      console.log('📋 API Monitor: Project Manager escalated, investigating API issues...');
      this.performDetailedAPIAnalysis();
    });
  }

  public startAPIMonitoring(): void {
    console.log('🔍 Starting API Health Monitoring...');
    console.log(`Monitoring ${this.apiEndpoints.length} API endpoints`);
    
    this.isMonitoring = true;
    this.projectManager.startSystem();

    // Check APIs every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performAPIHealthChecks();
    }, 30000);

    // Initial check
    this.performAPIHealthChecks();
  }

  public stopAPIMonitoring(): void {
    console.log('🛑 Stopping API monitoring...');
    this.isMonitoring = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.projectManager.stopSystem();
  }

  private async performAPIHealthChecks(): Promise<void> {
    if (!this.isMonitoring) return;

    console.log('🩺 Running API health checks...');
    
    for (const endpoint of this.apiEndpoints) {
      await this.checkAPIEndpoint(endpoint);
    }
  }

  private async checkAPIEndpoint(check: APIHealthCheck): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}${check.endpoint}`, {
        method: check.method,
        headers: check.headers || {},
        body: check.testPayload ? JSON.stringify(check.testPayload) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      if (check.expectedStatus && response.status !== check.expectedStatus) {
        console.log(`⚠️  API ${check.endpoint}: Expected ${check.expectedStatus}, got ${response.status}`);
        
        this.createAPIIncident(check.endpoint, {
          status: response.status,
          expected: check.expectedStatus,
          response: responseData,
          issue: 'Unexpected status code'
        });
      } else {
        console.log(`✅ API ${check.endpoint}: Status ${response.status} (as expected)`);
        
        // Check for specific error patterns
        if (responseData.error && this.isUnexpectedError(responseData.error)) {
          this.createAPIIncident(check.endpoint, {
            status: response.status,
            response: responseData,
            issue: `Unexpected error: ${responseData.error}`
          });
        }
      }

    } catch (error: any) {
      console.log(`❌ API ${check.endpoint}: ${error.message}`);
      
      this.createAPIIncident(check.endpoint, {
        issue: 'Request failed',
        error: error.message,
        type: error.name
      });
    }
  }

  private isUnexpectedError(error: string): boolean {
    const expectedErrors = [
      'Phone number and PIN are required',
      'Phone number is required',
      'Phone number and code are required',
      'Validation error'
    ];

    return !expectedErrors.some(expected => error.includes(expected));
  }

  private createAPIIncident(endpoint: string, details: any): void {
    const incident: Incident = {
      id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'BUILD_ERROR', // Using this as closest type for API issues
      severity: 'HIGH',
      description: `API issue at ${endpoint}: ${details.issue}`,
      timestamp: new Date(),
      resolved: false
    };

    console.log(`🚨 Created API incident: ${incident.id}`);
    console.log(`   Details:`, JSON.stringify(details, null, 2));

    // Emit to project manager
    this.projectManager['monitoringAgent'].emit('incident', incident);
  }

  private async performDetailedAPIAnalysis(): Promise<void> {
    console.log('🔬 Performing detailed API analysis...');

    // Test with actual valid data
    await this.testAuthFlow();
    
    // Check database connectivity
    await this.checkDatabaseConnection();
    
    // Check environment variables
    this.checkEnvironmentConfiguration();
  }

  private async testAuthFlow(): Promise<void> {
    console.log('🔐 Testing authentication flow...');

    // Test signin with proper data structure
    try {
      const testPayload = {
        phone: '+1234567890',
        pin: '1234'
      };

      const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      const data = await response.text();
      let parsed;
      
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { rawResponse: data };
      }

      console.log(`🔐 Auth test result: Status ${response.status}`);
      console.log(`   Response:`, JSON.stringify(parsed, null, 2));

      if (response.status === 500) {
        console.log('❌ Internal server error detected - likely database or configuration issue');
        await this.diagnoseDatabaseIssue();
      } else if (response.status === 400 && parsed.error !== 'Invalid phone number or PIN') {
        console.log('⚠️  Unexpected 400 error - checking request format');
      }

    } catch (error: any) {
      console.log('❌ Auth flow test failed:', error.message);
    }
  }

  private async checkDatabaseConnection(): Promise<void> {
    console.log('🗄️  Checking database connectivity...');
    
    // This would normally check Supabase connection
    console.log('   Database connection check not implemented yet');
    console.log('   Manual check: Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  }

  private checkEnvironmentConfiguration(): void {
    console.log('⚙️  Checking environment configuration...');
    
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
      console.log('   Check your .env file and restart the dev server');
    } else {
      console.log('✅ All required environment variables are set');
    }
  }

  private async diagnoseDatabaseIssue(): Promise<void> {
    console.log('🔍 Diagnosing database connectivity...');
    
    // Check if we can reach Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      console.log('❌ SUPABASE_URL not configured');
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
        }
      });

      if (response.ok) {
        console.log('✅ Supabase API is reachable');
      } else {
        console.log(`❌ Supabase API returned ${response.status}`);
      }
    } catch (error: any) {
      console.log('❌ Cannot reach Supabase:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const apiMonitor = new APIMonitoringAgent();
  
  console.log('🔍 GoTryke API Monitoring Agent');
  console.log('This monitors API endpoints for errors and connectivity issues.');
  console.log('Press Ctrl+C to stop.\n');
  
  apiMonitor.startAPIMonitoring();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping API monitoring...');
    apiMonitor.stopAPIMonitoring();
    process.exit(0);
  });
}