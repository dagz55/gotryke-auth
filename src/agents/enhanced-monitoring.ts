#!/usr/bin/env node

import { ProjectManager } from './project-manager';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export class EnhancedMonitoring {
  private projectManager: ProjectManager;
  private devServerProcess: ChildProcess | null = null;
  private isMonitoring = false;
  private logBuffer: string[] = [];

  constructor() {
    this.projectManager = new ProjectManager();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Override the project manager to be more aggressive
    this.projectManager.on('human_escalation', (report) => {
      console.log('\n🚨 ESCALATION: Taking immediate action!');
      this.handleEscalation(report);
    });
  }

  private async handleEscalation(report: any): Promise<void> {
    console.log('🔧 Enhanced Monitoring: Attempting aggressive recovery...');
    
    // Kill all Next.js processes
    await this.killAllNextProcesses();
    
    // Clear any potential lock files
    await this.clearLockFiles();
    
    // Restart dev server
    await this.restartDevServer();
    
    // Verify recovery
    setTimeout(() => {
      this.verifyRecovery();
    }, 10000);
  }

  private async killAllNextProcesses(): Promise<void> {
    console.log('💀 Killing all Next.js processes...');
    
    const processes = [
      'pkill -f "next dev"',
      'pkill -f "node_modules/.bin/next"',
      'lsof -ti:9002 | xargs kill -9'
    ];

    for (const cmd of processes) {
      try {
        const [command, ...args] = cmd.split(' ');
        const process = spawn(command, args);
        await new Promise(resolve => {
          process.on('close', resolve);
        });
        console.log(`✅ Executed: ${cmd}`);
      } catch (error) {
        console.log(`⚠️  Command failed (might be okay): ${cmd}`);
      }
    }
  }

  private async clearLockFiles(): Promise<void> {
    console.log('🗑️  Clearing potential lock files...');
    
    const lockFiles = [
      '.next/trace',
      '.next/cache',
      'node_modules/.cache',
      '.next/server'
    ];

    for (const lockFile of lockFiles) {
      try {
        await fs.rm(lockFile, { recursive: true, force: true });
        console.log(`✅ Cleared: ${lockFile}`);
      } catch (error) {
        console.log(`⚠️  Could not clear: ${lockFile} (might not exist)`);
      }
    }
  }

  private async restartDevServer(): Promise<void> {
    console.log('🚀 Starting fresh dev server...');
    
    this.devServerProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    let serverReady = false;

    this.devServerProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      this.logBuffer.push(output);
      
      console.log(`DEV SERVER: ${output.trim()}`);
      
      if ((output.includes('Ready') || output.includes('localhost:9002')) && !serverReady) {
        serverReady = true;
        console.log('✅ Dev server is ready!');
      }
    });

    this.devServerProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      this.logBuffer.push(`ERROR: ${error}`);
      console.error(`DEV SERVER ERROR: ${error.trim()}`);
    });

    this.devServerProcess.on('close', (code) => {
      console.log(`Dev server exited with code ${code}`);
      if (code !== 0) {
        console.log('⚠️  Server crashed! Attempting restart in 5 seconds...');
        setTimeout(() => {
          this.restartDevServer();
        }, 5000);
      }
    });
  }

  private async verifyRecovery(): Promise<void> {
    console.log('🔍 Verifying server recovery...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:9002', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Server recovery verified! System is healthy.');
      } else {
        console.log(`❌ Server responding with ${response.status}. May need manual intervention.`);
      }
    } catch (error) {
      console.log('❌ Server still not responding. Manual intervention required.');
      console.log('\nRecent logs:');
      this.logBuffer.slice(-10).forEach(log => console.log(`  ${log.trim()}`));
    }
  }

  public async startEnhancedMonitoring(): Promise<void> {
    console.log('🎯 Starting Enhanced Monitoring System...');
    console.log('This system will aggressively detect and fix dev server issues.');
    
    this.isMonitoring = true;
    
    // Start the regular monitoring
    this.projectManager.startSystem();
    
    // Add additional monitoring for build errors
    this.monitorBuildErrors();
    
    // Add file system watching
    this.monitorFileChanges();
  }

  private monitorBuildErrors(): void {
    console.log('🔍 Monitoring for build errors...');
    
    // Monitor for common error patterns
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      try {
        const response = await fetch('http://localhost:9002/_next/static/chunks/webpack.js', {
          method: 'HEAD'
        });
        
        if (!response.ok) {
          console.log('⚠️  Webpack chunks not loading properly - potential build error');
          this.triggerBuildErrorRecovery();
        }
      } catch (error) {
        console.log('⚠️  Webpack asset check failed - server might be down');
      }
    }, 15000);
  }

  private async triggerBuildErrorRecovery(): Promise<void> {
    console.log('🔧 Triggered build error recovery...');
    
    // Force a fake build error incident
    const incident = {
      id: `build-error-${Date.now()}`,
      type: 'BUILD_ERROR' as const,
      severity: 'HIGH' as const,
      description: 'Build error detected by enhanced monitoring',
      timestamp: new Date(),
      resolved: false
    };
    
    // Emit to the monitoring agent
    this.projectManager['monitoringAgent'].emit('incident', incident);
  }

  private monitorFileChanges(): void {
    console.log('📁 Monitoring critical file changes...');
    
    const criticalFiles = [
      'package.json',
      'next.config.ts',
      'tailwind.config.js',
      'tsconfig.json'
    ];
    
    // Simple file monitoring (in production you'd use fs.watch)
    criticalFiles.forEach(file => {
      setInterval(async () => {
        try {
          await fs.access(file);
        } catch (error) {
          console.log(`⚠️  Critical file missing or inaccessible: ${file}`);
        }
      }, 30000);
    });
  }

  public stopEnhancedMonitoring(): void {
    console.log('🛑 Stopping enhanced monitoring...');
    this.isMonitoring = false;
    this.projectManager.stopSystem();
    
    if (this.devServerProcess) {
      this.devServerProcess.kill();
    }
  }
}

// CLI interface
if (require.main === module) {
  const enhancedMonitoring = new EnhancedMonitoring();
  
  console.log('GoTryke Enhanced Monitoring');
  console.log('This provides more aggressive monitoring and recovery.');
  console.log('Press Ctrl+C to stop.\n');
  
  enhancedMonitoring.startEnhancedMonitoring();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down enhanced monitoring...');
    enhancedMonitoring.stopEnhancedMonitoring();
    process.exit(0);
  });
}