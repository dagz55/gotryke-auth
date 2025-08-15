import { ProjectManager } from './project-manager';

const projectManager = new ProjectManager();

console.log('🧪 Testing Monitoring System');
console.log('='.repeat(40));

projectManager.on('report_generated', (report) => {
  console.log(`📊 Report: ${report.systemStatus} - ${report.activeIncidents.length} incidents`);
});

projectManager.on('human_escalation', (report) => {
  console.log('🚨 ESCALATION TRIGGERED!');
  console.log(`Status: ${report.systemStatus}`);
  console.log(`Incidents: ${report.activeIncidents.length}`);
});

console.log('Starting monitoring system...');
projectManager.startSystem();

setTimeout(() => {
  console.log('\n📋 System Status after 30 seconds:');
  const status = projectManager.getSystemStatus();
  console.log(`Status: ${status}`);
  
  const report = projectManager.getLatestReport();
  if (report) {
    console.log(`Server Running: ${report.serverHealth.isRunning}`);
    console.log(`Active Incidents: ${report.activeIncidents.length}`);
    console.log(`Recommendations: ${report.recommendations.length}`);
  }
}, 30000);

setTimeout(() => {
  console.log('\n🛑 Stopping test...');
  projectManager.stopSystem();
  process.exit(0);
}, 60000);