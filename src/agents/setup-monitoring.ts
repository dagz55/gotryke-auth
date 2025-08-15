#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

async function setupMonitoring(): Promise<void> {
  console.log('🚀 Setting up GoTryke Monitoring System...\n');

  const projectRoot = process.cwd();
  const monitoringDir = path.join(projectRoot, '.gotryke', 'monitoring');
  
  try {
    // Create monitoring directories
    await fs.mkdir(monitoringDir, { recursive: true });
    console.log('✅ Created monitoring directories');

    // Create .gitignore entry for monitoring logs
    const gitignorePath = path.join(projectRoot, '.gitignore');
    let gitignoreContent = '';
    
    try {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    } catch {
      // .gitignore doesn't exist, which is fine
    }

    if (!gitignoreContent.includes('.gotryke')) {
      const newEntry = '\n# GoTryke Monitoring\n.gotryke/\n';
      await fs.writeFile(gitignorePath, gitignoreContent + newEntry);
      console.log('✅ Updated .gitignore');
    }

    // Create initial README for monitoring
    const readmePath = path.join(monitoringDir, 'README.md');
    const readmeContent = `# GoTryke Monitoring Logs

This directory contains monitoring logs and data for the GoTryke development server.

## Files:
- \`monitor.log\` - Main monitoring log file
- \`monitor.pid\` - Process ID of the monitoring daemon
- \`status.json\` - Current system status
- \`incidents.json\` - Historical incident data
- \`metrics.json\` - Performance metrics

## Log Rotation:
Logs are automatically rotated when they exceed 10MB.
Old logs are kept for 10 rotation cycles.

## Security:
This directory is excluded from git commits via .gitignore.
`;
    
    await fs.writeFile(readmePath, readmeContent);
    console.log('✅ Created monitoring README');

    console.log('\n🎯 Monitoring System Ready!');
    console.log('\nQuick Start:');
    console.log('  1. Start your dev server: npm run dev');
    console.log('  2. In another terminal, start monitoring daemon: npm run monitor:daemon start');
    console.log('  3. Open monitoring dashboard: npm run monitor:dashboard');
    console.log('  4. View dashboard at: http://localhost:9003');
    console.log('\nManagement Commands:');
    console.log('  npm run monitor:daemon status  - Check daemon status');
    console.log('  npm run monitor:daemon stop    - Stop monitoring');
    console.log('  npm run monitor:daemon logs    - View recent logs');
    console.log('\nTesting:');
    console.log('  npm run monitor:notify test    - Test notifications');
    console.log('  npm run monitor:test           - Quick monitoring test');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupMonitoring();