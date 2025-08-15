#!/usr/bin/env node

import { ProjectManager } from './project-manager';
import { Incident } from './monitoring-agent';

async function forceIncident(): Promise<void> {
  const projectManager = new ProjectManager();
  
  const incidentType = process.argv[2] as Incident['type'] || 'SERVER_DOWN';
  const severity = (process.argv[3] as Incident['severity']) || 'CRITICAL';
  const description = process.argv[4] || 'Manual test incident triggered by user';

  console.log('🚨 Creating forced incident to test monitoring system...');
  console.log(`Type: ${incidentType}`);
  console.log(`Severity: ${severity}`);
  console.log(`Description: ${description}`);

  // Create a fake incident to trigger the engineering agent
  const incident: Incident = {
    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: incidentType,
    severity,
    description,
    timestamp: new Date(),
    resolved: false
  };

  // Start the monitoring system
  projectManager.startSystem();

  // Wait a moment then inject the incident
  setTimeout(() => {
    console.log('\n📋 PROJECT MANAGER: Injecting test incident...');
    
    // Manually emit the incident event to trigger the engineering agent
    projectManager['monitoringAgent'].emit('incident', incident);
  }, 2000);

  // Stop after 30 seconds
  setTimeout(() => {
    console.log('\n🛑 Test complete, stopping system...');
    projectManager.stopSystem();
    process.exit(0);
  }, 30000);
}

if (require.main === module) {
  console.log('GoTryke Force Incident Tool');
  console.log('Usage: npm run monitor:force [type] [severity] [description]');
  console.log('');
  console.log('Types: SERVER_DOWN, SLOW_RESPONSE, BUILD_ERROR, CRASH');
  console.log('Severities: LOW, MEDIUM, HIGH, CRITICAL');
  console.log('');
  console.log('Example: npm run monitor:force SERVER_DOWN CRITICAL "Test server down scenario"');
  console.log('');
  
  forceIncident();
}