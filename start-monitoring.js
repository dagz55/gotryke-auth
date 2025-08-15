#!/usr/bin/env node

/**
 * Simple GoTryke Server Monitoring System
 * Monitors the development server and key components
 */

const http = require('http');
const https = require('https');

class SimpleMonitor {
  constructor() {
    this.startTime = new Date();
    this.checks = 0;
    this.failures = 0;
    this.isRunning = false;
    this.interval = null;
    
    console.log('🚀 Starting GoTryke Live Monitoring System...\n');
    this.displayHeader();
  }

  displayHeader() {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│              GoTryke Development Server Monitor              │');
    console.log('│                     Real-time Status                        │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log();
  }

  async checkHealth(url) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const request = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              statusCode: res.statusCode,
              responseTime,
              data: parsed
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              responseTime,
              statusCode: res.statusCode
            });
          }
        });
      });

      request.on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
          responseTime: Date.now() - startTime
        });
      });

      request.setTimeout(5000, () => {
        request.destroy();
        resolve({
          success: false,
          error: 'Timeout',
          responseTime: 5000
        });
      });
    });
  }

  getStatusIcon(isHealthy) {
    return isHealthy ? '🟢' : '🔴';
  }

  getResponseTimeIcon(time) {
    if (time < 500) return '🟢';
    if (time < 1500) return '🟡';
    return '🔴';
  }

  async performMonitoringCycle() {
    this.checks++;
    const now = new Date();
    
    console.log(`\n⏰ Check #${this.checks} - ${now.toLocaleTimeString()}`);
    console.log('─'.repeat(60));

    // Check main application
    const appHealth = await this.checkHealth('http://localhost:9002');
    console.log(`${this.getStatusIcon(appHealth.success)} Main App (Port 9002): ${appHealth.success ? 'ONLINE' : 'OFFLINE'}`);
    
    if (appHealth.success) {
      console.log(`   ${this.getResponseTimeIcon(appHealth.responseTime)} Response Time: ${appHealth.responseTime}ms`);
      console.log(`   📊 Status Code: ${appHealth.statusCode}`);
    } else {
      this.failures++;
      console.log(`   ❌ Error: ${appHealth.error}`);
    }

    // Check health endpoint
    const healthCheck = await this.checkHealth('http://localhost:9002/api/health');
    console.log(`${this.getStatusIcon(healthCheck.success)} Health Endpoint: ${healthCheck.success ? 'ONLINE' : 'OFFLINE'}`);
    
    if (healthCheck.success && healthCheck.data) {
      const health = healthCheck.data;
      console.log(`   ${this.getResponseTimeIcon(healthCheck.responseTime)} Response Time: ${healthCheck.responseTime}ms`);
      console.log(`   🗄️  Database: ${health.checks?.supabase?.ok ? '✅ Connected' : '❌ Failed'}`);
      console.log(`   📱 Twilio SMS: ${health.checks?.twilio?.ok ? '✅ Connected' : '❌ Failed'}`);
      console.log(`   🔧 Environment: ${Object.values(health.checks?.env || {}).every(Boolean) ? '✅ Complete' : '⚠️  Missing vars'}`);
      console.log(`   ⚡ Overall Status: ${health.ok ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    } else if (healthCheck.success) {
      console.log(`   ⚠️  Health check returned invalid data`);
    } else {
      console.log(`   ❌ Error: ${healthCheck.error}`);
    }

    // Display statistics
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const successRate = ((this.checks - this.failures) / this.checks * 100).toFixed(1);
    
    console.log('\n📈 Monitoring Statistics:');
    console.log(`   ⏱️  Uptime: ${uptime}s`);
    console.log(`   ✅ Success Rate: ${successRate}%`);
    console.log(`   📊 Total Checks: ${this.checks}`);
    console.log(`   ❌ Failures: ${this.failures}`);

    // Check for critical issues
    if (this.failures > 3 && successRate < 80) {
      console.log('\n🚨 CRITICAL ALERT: High failure rate detected!');
      console.log('   Consider checking server logs and configuration');
    }

    console.log('\n' + '═'.repeat(60));
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    this.isRunning = true;
    console.log('🎯 Starting live monitoring (checking every 10 seconds)...');
    console.log('   Press Ctrl+C to stop monitoring\n');

    // Perform initial check
    this.performMonitoringCycle();

    // Set up interval for continuous monitoring
    this.interval = setInterval(() => {
      this.performMonitoringCycle();
    }, 10000); // Check every 10 seconds
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Monitoring is not running');
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    console.log('\n🛑 Monitoring stopped');
    console.log(`📊 Final Statistics:`);
    console.log(`   Total Checks: ${this.checks}`);
    console.log(`   Failures: ${this.failures}`);
    console.log(`   Success Rate: ${((this.checks - this.failures) / this.checks * 100).toFixed(1)}%`);
  }
}

// Handle graceful shutdown
const monitor = new SimpleMonitor();

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Received interrupt signal...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Received termination signal...');
  monitor.stop();
  process.exit(0);
});

// Start monitoring
monitor.start();