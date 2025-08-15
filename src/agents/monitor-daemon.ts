#!/usr/bin/env node

import { ProjectManager } from './project-manager';
import { MonitoringLogger } from './monitoring-logger';
import * as fs from 'fs/promises';
import * as path from 'path';

class MonitoringDaemon {
  private projectManager: ProjectManager;
  private logger: MonitoringLogger;
  private isRunning = false;
  private pidFile: string;
  private logFile: string;
  private statusFile: string;
  private startTime: Date;

  constructor() {
    const projectRoot = process.cwd();
    const logsDir = path.join(projectRoot, '.gotryke', 'monitoring');
    
    this.pidFile = path.join(logsDir, 'monitor.pid');
    this.logFile = path.join(logsDir, 'monitor.log');
    this.statusFile = path.join(logsDir, 'status.json');
    
    this.logger = new MonitoringLogger(logsDir);
    this.projectManager = new ProjectManager(projectRoot);
    this.startTime = new Date();
    
    this.setupEventHandlers();
    this.setupProcessHandlers();
  }

  private setupEventHandlers(): void {
    this.projectManager.on('report_generated', (report) => {
      this.logger.logReport(report);
      this.updateStatusFile(report);
      
      if (report.systemStatus !== 'HEALTHY') {
        this.logger.logAlert(`System status changed to ${report.systemStatus}`, 'WARNING');
      }
    });

    this.projectManager.on('human_escalation', (report) => {
      this.logger.logAlert('HUMAN ESCALATION REQUIRED', 'CRITICAL');
      this.logger.logReport(report);
      
      // Send desktop notification if available
      this.sendDesktopNotification(
        'GoTryke Monitoring Alert',
        `Critical issue detected. System status: ${report.systemStatus}. ${report.activeIncidents.length} active incidents.`
      );
    });
  }

  private setupProcessHandlers(): void {
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGUSR1', () => this.showStatus());
    process.on('SIGUSR2', () => this.showDetailedReport());
    
    process.on('uncaughtException', (error) => {
      this.logger.logError('Uncaught exception in monitoring daemon', error);
      this.shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.logError('Unhandled promise rejection in monitoring daemon', new Error(String(reason)));
    });
  }

  public async start(): Promise<void> {
    try {
      // Check if already running
      if (await this.isAlreadyRunning()) {
        console.log('❌ Monitoring daemon is already running');
        process.exit(1);
      }

      // Create logs directory
      await fs.mkdir(path.dirname(this.pidFile), { recursive: true });

      // Write PID file
      await fs.writeFile(this.pidFile, process.pid.toString());

      this.isRunning = true;
      
      console.log('🚀 Starting GoTryke Monitoring Daemon...');
      console.log(`📝 Logs: ${this.logFile}`);
      console.log(`📊 Status: ${this.statusFile}`);
      console.log(`🆔 PID: ${process.pid}`);
      console.log('');
      console.log('Send signals to control:');
      console.log(`  kill -USR1 ${process.pid}  # Show status`);
      console.log(`  kill -USR2 ${process.pid}  # Show detailed report`);
      console.log(`  kill -TERM ${process.pid}  # Graceful shutdown`);
      console.log('');

      this.logger.logInfo('Monitoring daemon started', {
        pid: process.pid,
        startTime: this.startTime.toISOString(),
        nodeVersion: process.version,
        workingDirectory: process.cwd()
      });

      // Start the monitoring system
      this.projectManager.startSystem();

      // Keep the process alive and log periodic status
      setInterval(() => {
        this.logPeriodicStatus();
      }, 300000); // Every 5 minutes

      console.log('✅ Monitoring daemon is running in background');
      console.log('Use Ctrl+C or send SIGTERM to stop');

    } catch (error) {
      console.error('❌ Failed to start monitoring daemon:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  private async isAlreadyRunning(): Promise<boolean> {
    try {
      const pidData = await fs.readFile(this.pidFile, 'utf-8');
      const pid = parseInt(pidData.trim());
      
      // Check if process is still running
      try {
        process.kill(pid, 0); // Signal 0 just checks if process exists
        return true;
      } catch {
        // Process doesn't exist, remove stale PID file
        await fs.unlink(this.pidFile).catch(() => {});
        return false;
      }
    } catch {
      return false;
    }
  }

  private async updateStatusFile(report: any): Promise<void> {
    const status = {
      daemon: {
        pid: process.pid,
        startTime: this.startTime.toISOString(),
        uptime: Date.now() - this.startTime.getTime(),
        version: '1.0.0'
      },
      system: report,
      lastUpdate: new Date().toISOString()
    };

    try {
      await fs.writeFile(this.statusFile, JSON.stringify(status, null, 2));
    } catch (error) {
      this.logger.logError('Failed to update status file', error as Error);
    }
  }

  private logPeriodicStatus(): void {
    const report = this.projectManager.getLatestReport();
    const uptime = Date.now() - this.startTime.getTime();
    
    this.logger.logInfo('Periodic status check', {
      uptime: Math.floor(uptime / 1000) + ' seconds',
      systemStatus: report?.systemStatus || 'UNKNOWN',
      activeIncidents: report?.activeIncidents.length || 0,
      memoryUsage: process.memoryUsage()
    });
  }

  private showStatus(): void {
    const report = this.projectManager.getLatestReport();
    const uptime = Date.now() - this.startTime.getTime();
    
    console.log('\n📊 MONITORING DAEMON STATUS');
    console.log('='.repeat(40));
    console.log(`PID: ${process.pid}`);
    console.log(`Uptime: ${Math.floor(uptime / 1000)}s`);
    console.log(`System Status: ${report?.systemStatus || 'UNKNOWN'}`);
    console.log(`Active Incidents: ${report?.activeIncidents.length || 0}`);
    console.log(`Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log('='.repeat(40));
  }

  private showDetailedReport(): void {
    const detailed = this.projectManager.getDetailedReport();
    console.log('\n📋 DETAILED SYSTEM REPORT');
    console.log(JSON.stringify(detailed, null, 2));
  }

  private sendDesktopNotification(title: string, message: string): void {
    // macOS notification
    if (process.platform === 'darwin') {
      const { spawn } = require('child_process');
      spawn('osascript', [
        '-e',
        `display notification "${message}" with title "${title}" sound name "Glass"`
      ]);
    }
    // Log as fallback
    console.log(`\n🔔 NOTIFICATION: ${title}\n${message}\n`);
  }

  private async shutdown(reason: string): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(`\n🛑 Shutting down monitoring daemon (${reason})...`);
    this.isRunning = false;

    try {
      // Stop monitoring
      this.projectManager.stopSystem();
      
      // Log shutdown
      this.logger.logInfo('Monitoring daemon shutting down', {
        reason,
        uptime: Date.now() - this.startTime.getTime()
      });

      // Cleanup
      await this.cleanup();
      
      console.log('✅ Monitoring daemon stopped gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await fs.unlink(this.pidFile);
    } catch {
      // PID file might not exist
    }
  }
}

// CLI interface
const daemon = new MonitoringDaemon();

const command = process.argv[2];

switch (command) {
  case 'start':
    daemon.start();
    break;
    
  case 'status':
    // Show status by reading status file
    (async () => {
      try {
        const statusFile = path.join(process.cwd(), '.gotryke', 'monitoring', 'status.json');
        const status = JSON.parse(await fs.readFile(statusFile, 'utf-8'));
        
        console.log('\n📊 CURRENT STATUS');
        console.log('='.repeat(30));
        console.log(`Daemon PID: ${status.daemon.pid}`);
        console.log(`Uptime: ${Math.floor(status.daemon.uptime / 1000)}s`);
        console.log(`System Status: ${status.system.systemStatus}`);
        console.log(`Server Running: ${status.system.serverHealth.isRunning ? '✅' : '❌'}`);
        console.log(`Active Incidents: ${status.system.activeIncidents.length}`);
        console.log(`Last Update: ${new Date(status.lastUpdate).toLocaleString()}`);
      } catch {
        console.log('❌ Monitoring daemon is not running or status file not found');
      }
    })();
    break;
    
  case 'stop':
    (async () => {
      try {
        const pidFile = path.join(process.cwd(), '.gotryke', 'monitoring', 'monitor.pid');
        const pid = parseInt(await fs.readFile(pidFile, 'utf-8'));
        process.kill(pid, 'SIGTERM');
        console.log(`✅ Sent shutdown signal to daemon (PID: ${pid})`);
      } catch {
        console.log('❌ Monitoring daemon is not running or PID file not found');
      }
    })();
    break;

  case 'logs':
    (async () => {
      try {
        const logFile = path.join(process.cwd(), '.gotryke', 'monitoring', 'monitor.log');
        const logs = await fs.readFile(logFile, 'utf-8');
        console.log(logs.split('\n').slice(-50).join('\n')); // Last 50 lines
      } catch {
        console.log('❌ Log file not found');
      }
    })();
    break;

  default:
    console.log('GoTryke Monitoring Daemon');
    console.log('');
    console.log('Usage:');
    console.log('  npm run monitor:daemon start  - Start monitoring daemon');
    console.log('  npm run monitor:daemon stop   - Stop monitoring daemon');
    console.log('  npm run monitor:daemon status - Show current status');
    console.log('  npm run monitor:daemon logs   - Show recent logs');
}