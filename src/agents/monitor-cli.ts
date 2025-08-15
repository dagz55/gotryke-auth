#!/usr/bin/env node

import { ProjectManager } from './project-manager';
import * as readline from 'readline';

const projectManager = new ProjectManager();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🎯 GoTryke Development Server Monitoring System');
console.log('='.repeat(60));
console.log('Available commands:');
console.log('  start    - Start monitoring system');
console.log('  stop     - Stop monitoring system');
console.log('  status   - Show current system status');
console.log('  report   - Show detailed system report');
console.log('  history  - Show recent reports');
console.log('  clear    - Clear report history');
console.log('  help     - Show this help message');
console.log('  exit     - Exit the monitoring system');
console.log('='.repeat(60));

let isRunning = false;

projectManager.on('report_generated', (report) => {
  if (report.systemStatus !== 'HEALTHY') {
    console.log(`\n⚠️  System Status Changed: ${report.systemStatus}`);
    console.log(`Active Incidents: ${report.activeIncidents.length}`);
  }
});

projectManager.on('human_escalation', (report) => {
  console.log('\n🔔 ALERT: Human intervention required!');
  console.log('Type "report" to see detailed information.');
});

function showStatus(): void {
  const status = projectManager.getSystemStatus();
  const report = projectManager.getLatestReport();
  
  console.log('\n📊 CURRENT SYSTEM STATUS');
  console.log('-'.repeat(30));
  console.log(`Status: ${getStatusEmoji(status)} ${status}`);
  
  if (report) {
    console.log(`Server Running: ${report.serverHealth.isRunning ? '✅' : '❌'}`);
    console.log(`Response Time: ${report.serverHealth.responseTime || 'N/A'}ms`);
    console.log(`Active Incidents: ${report.activeIncidents.length}`);
    console.log(`Last Check: ${report.serverHealth.lastCheck.toLocaleTimeString()}`);
    
    if (report.activeIncidents.length > 0) {
      console.log('\nACTIVE INCIDENTS:');
      report.activeIncidents.forEach(incident => {
        console.log(`  🚨 ${incident.type} (${incident.severity}): ${incident.description}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  💡 ${rec}`);
      });
    }
  }
}

function showReport(): void {
  const detailed = projectManager.getDetailedReport();
  
  console.log('\n📋 DETAILED SYSTEM REPORT');
  console.log('='.repeat(50));
  
  if (detailed.system) {
    console.log(`Status: ${getStatusEmoji(detailed.system.systemStatus)} ${detailed.system.systemStatus}`);
    console.log(`Report Time: ${detailed.system.timestamp.toLocaleString()}`);
  }
  
  console.log('\n🔍 SERVER HEALTH:');
  console.log(`  Running: ${detailed.monitoring.health.isRunning ? '✅' : '❌'}`);
  console.log(`  Port: ${detailed.monitoring.health.port}`);
  console.log(`  Response Time: ${detailed.monitoring.health.responseTime || 'N/A'}ms`);
  console.log(`  Last Check: ${detailed.monitoring.health.lastCheck.toLocaleString()}`);
  
  if (detailed.monitoring.health.errors.length > 0) {
    console.log('  Errors:');
    detailed.monitoring.health.errors.forEach(error => {
      console.log(`    ❌ ${error}`);
    });
  }
  
  console.log('\n📈 INCIDENT HISTORY:');
  const recentIncidents = detailed.monitoring.incidents.slice(-5);
  if (recentIncidents.length === 0) {
    console.log('  No incidents recorded');
  } else {
    recentIncidents.forEach(incident => {
      const status = incident.resolved ? '✅' : '🚨';
      console.log(`  ${status} ${incident.type} (${incident.severity})`);
      console.log(`     ${incident.description}`);
      console.log(`     Time: ${incident.timestamp.toLocaleString()}`);
    });
  }
  
  console.log('\n🔧 RECENT FIXES:');
  const recentFixes = detailed.engineering.fixHistory.slice(-3);
  if (recentFixes.length === 0) {
    console.log('  No fixes attempted');
  } else {
    recentFixes.forEach(fix => {
      const status = fix.success ? '✅' : '❌';
      console.log(`  ${status} ${fix.action}: ${fix.description}`);
      console.log(`     Time: ${fix.timestamp.toLocaleString()}`);
      if (fix.error) {
        console.log(`     Error: ${fix.error}`);
      }
    });
  }
}

function showHistory(): void {
  const reports = projectManager.getReports(5);
  
  console.log('\n📚 RECENT REPORTS');
  console.log('-'.repeat(30));
  
  if (reports.length === 0) {
    console.log('No reports available');
    return;
  }
  
  reports.forEach((report, index) => {
    console.log(`${index + 1}. ${report.timestamp.toLocaleString()}`);
    console.log(`   Status: ${getStatusEmoji(report.systemStatus)} ${report.systemStatus}`);
    console.log(`   Incidents: ${report.activeIncidents.length}`);
    console.log(`   Server: ${report.serverHealth.isRunning ? '✅' : '❌'}`);
    console.log('');
  });
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'HEALTHY': return '🟢';
    case 'DEGRADED': return '🟡';
    case 'CRITICAL': return '🟠';
    case 'DOWN': return '🔴';
    default: return '❓';
  }
}

function prompt(): void {
  rl.question('\nmonitor> ', (input) => {
    const command = input.trim().toLowerCase();
    
    switch (command) {
      case 'start':
        if (isRunning) {
          console.log('Monitoring is already running');
        } else {
          projectManager.startSystem();
          isRunning = true;
          console.log('✅ Monitoring system started');
        }
        break;
        
      case 'stop':
        if (!isRunning) {
          console.log('Monitoring is not running');
        } else {
          projectManager.stopSystem();
          isRunning = false;
          console.log('✅ Monitoring system stopped');
        }
        break;
        
      case 'status':
        showStatus();
        break;
        
      case 'report':
        showReport();
        break;
        
      case 'history':
        showHistory();
        break;
        
      case 'clear':
        projectManager.clearReports();
        console.log('✅ Report history cleared');
        break;
        
      case 'help':
        console.log('\n📋 Available Commands:');
        console.log('  start    - Start monitoring system');
        console.log('  stop     - Stop monitoring system');
        console.log('  status   - Show current system status');
        console.log('  report   - Show detailed system report');
        console.log('  history  - Show recent reports');
        console.log('  clear    - Clear report history');
        console.log('  help     - Show this help message');
        console.log('  exit     - Exit the monitoring system');
        break;
        
      case 'exit':
      case 'quit':
        if (isRunning) {
          projectManager.stopSystem();
        }
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
        break;
        
      case '':
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }
    
    if (command !== 'exit' && command !== 'quit') {
      prompt();
    }
  });
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down monitoring system...');
  if (isRunning) {
    projectManager.stopSystem();
  }
  rl.close();
  process.exit(0);
});

prompt();