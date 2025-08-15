import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Incident } from './monitoring-agent';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FixAction {
  id: string;
  incidentId: string;
  action: 'RESTART_SERVER' | 'INSTALL_DEPS' | 'FIX_CONFIG' | 'CLEAR_CACHE' | 'KILL_PROCESS';
  description: string;
  timestamp: Date;
  success?: boolean;
  error?: string;
}

export interface DiagnosticResult {
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedFix: string;
  autoFixable: boolean;
}

export class IncidentEngineeringAgent extends EventEmitter {
  private activeIncidents: Map<string, Incident> = new Map();
  private fixHistory: FixAction[] = [];
  private serverProcess: ChildProcess | null = null;
  private readonly projectRoot: string;

  constructor(projectRoot: string = '/Users/robertsuarez/gotryke-auth') {
    super();
    this.projectRoot = projectRoot;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('fix_attempted', (fixAction: FixAction) => {
      this.fixHistory.push(fixAction);
      this.notifyProjectManager({
        type: 'FIX_ATTEMPTED',
        action: fixAction
      });
    });

    this.on('fix_completed', (fixAction: FixAction) => {
      this.notifyProjectManager({
        type: 'FIX_COMPLETED',
        action: fixAction
      });
    });
  }

  public async handleIncident(incident: Incident): Promise<void> {
    console.log(`\n🔧 Incident Engineering Agent: Processing incident ${incident.id}`);
    console.log(`   Type: ${incident.type}`);
    console.log(`   Severity: ${incident.severity}`);
    
    this.activeIncidents.set(incident.id, incident);

    const diagnostic = await this.diagnoseIncident(incident);
    console.log(`📊 Diagnosis: ${diagnostic.issue}`);
    console.log(`💡 Suggested Fix: ${diagnostic.suggestedFix}`);

    if (diagnostic.autoFixable && incident.severity !== 'LOW') {
      await this.attemptAutoFix(incident, diagnostic);
    } else {
      this.escalateToProjectManager(incident, diagnostic);
    }
  }

  private async diagnoseIncident(incident: Incident): Promise<DiagnosticResult> {
    switch (incident.type) {
      case 'SERVER_DOWN':
        return await this.diagnoseServerDown(incident);
      
      case 'BUILD_ERROR':
        return await this.diagnoseBuildError(incident);
      
      case 'SLOW_RESPONSE':
        return {
          issue: 'Server is responding slowly',
          severity: 'MEDIUM',
          suggestedFix: 'Check for memory leaks or heavy processes',
          autoFixable: false
        };
      
      case 'CRASH':
        return await this.diagnoseCrash(incident);
      
      default:
        return {
          issue: 'Unknown incident type',
          severity: 'MEDIUM',
          suggestedFix: 'Manual investigation required',
          autoFixable: false
        };
    }
  }

  private async diagnoseServerDown(incident: Incident): Promise<DiagnosticResult> {
    if (incident.description.includes('ECONNREFUSED')) {
      const isProcessRunning = await this.checkIfServerProcessRunning();
      
      if (!isProcessRunning) {
        return {
          issue: 'Dev server process is not running',
          severity: 'HIGH',
          suggestedFix: 'Restart the development server',
          autoFixable: true
        };
      } else {
        return {
          issue: 'Server process exists but not responding on port 9002',
          severity: 'HIGH',
          suggestedFix: 'Kill existing process and restart server',
          autoFixable: true
        };
      }
    }

    return {
      issue: 'Server connectivity issue',
      severity: 'HIGH',
      suggestedFix: 'Check network configuration and restart server',
      autoFixable: true
    };
  }

  private async diagnoseBuildError(incident: Incident): Promise<DiagnosticResult> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      return {
        issue: 'Build process failed',
        severity: 'HIGH',
        suggestedFix: 'Install missing dependencies and restart server',
        autoFixable: true
      };
    } catch (error) {
      return {
        issue: 'Build error with corrupted package.json',
        severity: 'CRITICAL',
        suggestedFix: 'Manual intervention required to fix package.json',
        autoFixable: false
      };
    }
  }

  private async diagnoseCrash(incident: Incident): Promise<DiagnosticResult> {
    return {
      issue: 'Application crashed unexpectedly',
      severity: 'CRITICAL',
      suggestedFix: 'Restart server and check logs for root cause',
      autoFixable: true
    };
  }

  private async attemptAutoFix(incident: Incident, diagnostic: DiagnosticResult): Promise<void> {
    console.log(`🤖 Attempting automatic fix for incident ${incident.id}...`);

    let fixAction: FixAction;

    switch (incident.type) {
      case 'SERVER_DOWN':
        fixAction = await this.fixServerDown(incident);
        break;
      
      case 'BUILD_ERROR':
        fixAction = await this.fixBuildError(incident);
        break;
      
      case 'CRASH':
        fixAction = await this.fixCrash(incident);
        break;
      
      default:
        fixAction = {
          id: `fix-${Date.now()}`,
          incidentId: incident.id,
          action: 'RESTART_SERVER',
          description: 'Default recovery action',
          timestamp: new Date(),
          success: false,
          error: 'No specific fix available for incident type'
        };
    }

    this.emit('fix_attempted', fixAction);

    if (fixAction.success) {
      console.log(`✅ Fix successful for incident ${incident.id}`);
      await this.waitAndVerifyFix(incident.id);
    } else {
      console.log(`❌ Fix failed for incident ${incident.id}: ${fixAction.error}`);
      this.escalateToProjectManager(incident, diagnostic);
    }
  }

  private async fixServerDown(incident: Incident): Promise<FixAction> {
    const fixAction: FixAction = {
      id: `fix-${Date.now()}`,
      incidentId: incident.id,
      action: 'RESTART_SERVER',
      description: 'Restarting development server',
      timestamp: new Date()
    };

    try {
      await this.killExistingServerProcess();
      await this.startDevServer();
      
      fixAction.success = true;
      console.log('🟢 Dev server restarted successfully');
    } catch (error) {
      fixAction.success = false;
      fixAction.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`🔴 Failed to restart server: ${fixAction.error}`);
    }

    return fixAction;
  }

  private async fixBuildError(incident: Incident): Promise<FixAction> {
    const fixAction: FixAction = {
      id: `fix-${Date.now()}`,
      incidentId: incident.id,
      action: 'INSTALL_DEPS',
      description: 'Installing dependencies and restarting server',
      timestamp: new Date()
    };

    try {
      await this.installDependencies();
      await this.killExistingServerProcess();
      await this.startDevServer();
      
      fixAction.success = true;
      console.log('🟢 Dependencies installed and server restarted');
    } catch (error) {
      fixAction.success = false;
      fixAction.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`🔴 Failed to fix build error: ${fixAction.error}`);
    }

    return fixAction;
  }

  private async fixCrash(incident: Incident): Promise<FixAction> {
    const fixAction: FixAction = {
      id: `fix-${Date.now()}`,
      incidentId: incident.id,
      action: 'RESTART_SERVER',
      description: 'Restarting server after crash',
      timestamp: new Date()
    };

    try {
      await this.killExistingServerProcess();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await this.startDevServer();
      
      fixAction.success = true;
      console.log('🟢 Server restarted after crash');
    } catch (error) {
      fixAction.success = false;
      fixAction.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`🔴 Failed to restart after crash: ${fixAction.error}`);
    }

    return fixAction;
  }

  private async checkIfServerProcessRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const lsof = spawn('lsof', ['-i', ':9002']);
      
      lsof.on('close', (code) => {
        resolve(code === 0);
      });
      
      lsof.on('error', () => {
        resolve(false);
      });
    });
  }

  private async killExistingServerProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      const killProcess = spawn('pkill', ['-f', 'next dev -p 9002']);
      
      killProcess.on('close', (code) => {
        setTimeout(resolve, 1000); // Give process time to die
      });
      
      killProcess.on('error', (error) => {
        console.log('No existing process to kill');
        resolve();
      });
    });
  }

  private async startDevServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting dev server...');
      
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: this.projectRoot,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let serverStarted = false;
      
      this.serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`Server: ${output.trim()}`);
        
        if (output.includes('Ready') || output.includes('localhost:9002')) {
          if (!serverStarted) {
            serverStarted = true;
            resolve();
          }
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        console.error(`Server Error: ${data.toString()}`);
      });

      this.serverProcess.on('close', (code) => {
        console.log(`Dev server exited with code ${code}`);
        this.serverProcess = null;
      });

      setTimeout(() => {
        if (!serverStarted) {
          resolve(); // Assume it started even if we didn't see confirmation
        }
      }, 10000);
    });
  }

  private async installDependencies(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📦 Installing dependencies...');
      
      const npm = spawn('npm', ['install'], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      npm.stdout?.on('data', (data) => {
        console.log(`NPM: ${data.toString().trim()}`);
      });

      npm.stderr?.on('data', (data) => {
        console.error(`NPM Error: ${data.toString()}`);
      });

      npm.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  private async waitAndVerifyFix(incidentId: string): Promise<void> {
    console.log(`⏳ Waiting 30 seconds to verify fix for incident ${incidentId}...`);
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:9002', { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      if (response.ok) {
        console.log(`✅ Fix verified successfully for incident ${incidentId}`);
        this.activeIncidents.delete(incidentId);
        this.emit('fix_completed', this.fixHistory[this.fixHistory.length - 1]);
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Fix verification failed for incident ${incidentId}: ${error}`);
      this.escalateToProjectManager(
        this.activeIncidents.get(incidentId)!,
        { issue: 'Fix verification failed', severity: 'HIGH', suggestedFix: 'Manual intervention required', autoFixable: false }
      );
    }
  }

  private escalateToProjectManager(incident: Incident, diagnostic: DiagnosticResult): void {
    this.notifyProjectManager({
      type: 'ESCALATION_REQUIRED',
      incident,
      diagnostic,
      message: 'Automatic fix not available or failed. Manual intervention required.'
    });
  }

  private notifyProjectManager(data: any): void {
    console.log('\n=== PROJECT MANAGER ESCALATION ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    switch (data.type) {
      case 'FIX_ATTEMPTED':
        console.log(`🔧 FIX ATTEMPTED: ${data.action.description}`);
        console.log(`   Action: ${data.action.action}`);
        console.log(`   Incident: ${data.action.incidentId}`);
        break;
        
      case 'FIX_COMPLETED':
        console.log(`✅ FIX COMPLETED SUCCESSFULLY`);
        console.log(`   Action: ${data.action.description}`);
        console.log(`   Incident: ${data.action.incidentId}`);
        break;
        
      case 'ESCALATION_REQUIRED':
        console.log(`🚨 MANUAL INTERVENTION REQUIRED`);
        console.log(`   Incident: ${data.incident.id}`);
        console.log(`   Issue: ${data.diagnostic.issue}`);
        console.log(`   Suggested Action: ${data.diagnostic.suggestedFix}`);
        console.log(`   Message: ${data.message}`);
        break;
    }
    console.log('==================================\n');
  }

  public getFixHistory(): FixAction[] {
    return [...this.fixHistory];
  }

  public getActiveIncidents(): Incident[] {
    return Array.from(this.activeIncidents.values());
  }
}