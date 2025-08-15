import { EventEmitter } from 'events';
import { MonitoringAgent, Incident, ServerHealth } from './monitoring-agent';
import { IncidentEngineeringAgent, FixAction } from './incident-engineering-agent';
import { MonitoringLogger } from './monitoring-logger';
import { NotificationService } from './notification-service';

export interface ProjectManagerReport {
  timestamp: Date;
  serverHealth: ServerHealth;
  activeIncidents: Incident[];
  recentFixes: FixAction[];
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'DOWN';
  recommendations: string[];
}

export class ProjectManager extends EventEmitter {
  private monitoringAgent: MonitoringAgent;
  private engineeringAgent: IncidentEngineeringAgent;
  private logger: MonitoringLogger;
  private notifications: NotificationService;
  private reports: ProjectManagerReport[] = [];
  private escalationThreshold = 3; // Auto-escalate after 3 failed fixes
  
  constructor(projectRoot?: string, logsDir?: string) {
    super();
    
    const logsDirPath = logsDir || `${projectRoot || process.cwd()}/.gotryke/monitoring`;
    this.logger = new MonitoringLogger(logsDirPath);
    this.notifications = new NotificationService();
    
    this.monitoringAgent = new MonitoringAgent(this.logger);
    this.engineeringAgent = new IncidentEngineeringAgent(projectRoot);
    
    this.setupAgentCommunication();
  }

  private setupAgentCommunication(): void {
    this.monitoringAgent.on('incident', (incident: Incident) => {
      console.log(`\n📋 PROJECT MANAGER: New incident received`);
      console.log(`   ID: ${incident.id}`);
      console.log(`   Type: ${incident.type}`);
      console.log(`   Severity: ${incident.severity}`);
      
      this.notifications.notifyIncident(incident);
      this.engineeringAgent.handleIncident(incident);
      this.generateReport();
    });

    this.monitoringAgent.on('incident_resolved', (incidentId: string) => {
      console.log(`\n📋 PROJECT MANAGER: Incident ${incidentId} marked as resolved`);
      this.generateReport();
    });

    this.engineeringAgent.on('fix_attempted', (fixAction: FixAction) => {
      console.log(`\n📋 PROJECT MANAGER: Fix attempted for incident ${fixAction.incidentId}`);
      console.log(`   Action: ${fixAction.action}`);
      console.log(`   Success: ${fixAction.success}`);
    });

    this.engineeringAgent.on('fix_completed', (fixAction: FixAction) => {
      console.log(`\n📋 PROJECT MANAGER: Fix completed successfully`);
      console.log(`   Incident: ${fixAction.incidentId}`);
      console.log(`   Action: ${fixAction.description}`);
    });
  }

  public startSystem(): void {
    console.log('\n🎯 PROJECT MANAGER: Starting monitoring system...');
    console.log('='.repeat(50));
    console.log('🤖 Monitoring Agent: Watching dev server health');
    console.log('🔧 Engineering Agent: Ready to handle incidents');
    console.log('📋 Project Manager: Coordinating system operations');
    console.log('🔔 Notification Service: Desktop alerts enabled');
    console.log('📝 Logger: Persistent logging enabled');
    console.log('='.repeat(50));
    
    this.logger.logInfo('Monitoring system started');
    this.notifications.notifyDaemonStart();
    this.monitoringAgent.startMonitoring();
    
    setInterval(() => {
      this.generateReport();
    }, 60000); // Generate report every minute
  }

  public stopSystem(): void {
    console.log('\n📋 PROJECT MANAGER: Stopping monitoring system...');
    this.logger.logInfo('Monitoring system stopped');
    this.notifications.notifyDaemonStop();
    this.monitoringAgent.stopMonitoring();
  }

  private generateReport(): void {
    const serverHealth = this.monitoringAgent.getHealthStatus();
    const activeIncidents = this.monitoringAgent.getActiveIncidents();
    const recentFixes = this.engineeringAgent.getFixHistory().slice(-5);
    
    const systemStatus = this.determineSystemStatus(serverHealth, activeIncidents);
    const recommendations = this.generateRecommendations(activeIncidents, recentFixes);
    
    const report: ProjectManagerReport = {
      timestamp: new Date(),
      serverHealth,
      activeIncidents,
      recentFixes,
      systemStatus,
      recommendations
    };
    
    this.reports.push(report);
    
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100); // Keep last 100 reports
    }
    
    this.emit('report_generated', report);
    
    if (this.shouldEscalate(activeIncidents, recentFixes)) {
      this.escalateToHuman(report);
    }
  }

  private determineSystemStatus(health: ServerHealth, incidents: Incident[]): ProjectManagerReport['systemStatus'] {
    if (!health.isRunning) {
      return 'DOWN';
    }
    
    const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL');
    const highIncidents = incidents.filter(i => i.severity === 'HIGH');
    
    if (criticalIncidents.length > 0) {
      return 'CRITICAL';
    }
    
    if (highIncidents.length > 0 || incidents.length > 2) {
      return 'DEGRADED';
    }
    
    return 'HEALTHY';
  }

  private generateRecommendations(incidents: Incident[], fixes: FixAction[]): string[] {
    const recommendations: string[] = [];
    
    if (incidents.length === 0) {
      recommendations.push('System is healthy - no action required');
      return recommendations;
    }
    
    const failedFixes = fixes.filter(f => !f.success);
    const recentFailures = failedFixes.filter(f => 
      Date.now() - f.timestamp.getTime() < 300000 // Last 5 minutes
    );
    
    if (recentFailures.length >= 3) {
      recommendations.push('Multiple fix failures detected - consider manual intervention');
    }
    
    const serverDownIncidents = incidents.filter(i => i.type === 'SERVER_DOWN');
    if (serverDownIncidents.length > 0) {
      recommendations.push('Server is down - automatic restart will be attempted');
    }
    
    const slowResponseIncidents = incidents.filter(i => i.type === 'SLOW_RESPONSE');
    if (slowResponseIncidents.length > 0) {
      recommendations.push('Performance issues detected - monitor resource usage');
    }
    
    const buildErrorIncidents = incidents.filter(i => i.type === 'BUILD_ERROR');
    if (buildErrorIncidents.length > 0) {
      recommendations.push('Build errors detected - dependencies may need updating');
    }
    
    return recommendations;
  }

  private shouldEscalate(incidents: Incident[], fixes: FixAction[]): boolean {
    const recentFailedFixes = fixes.filter(f => 
      !f.success && Date.now() - f.timestamp.getTime() < 600000 // Last 10 minutes
    );
    
    return recentFailedFixes.length >= this.escalationThreshold ||
           incidents.some(i => i.severity === 'CRITICAL' && 
             Date.now() - i.timestamp.getTime() > 300000 // Critical incident lasting > 5 minutes
           );
  }

  private escalateToHuman(report: ProjectManagerReport): void {
    console.log('\n🚨 HUMAN ESCALATION REQUIRED 🚨');
    console.log('='.repeat(50));
    console.log(`System Status: ${report.systemStatus}`);
    console.log(`Active Incidents: ${report.activeIncidents.length}`);
    console.log(`Failed Fixes: ${report.recentFixes.filter(f => !f.success).length}`);
    console.log('\nCRITICAL INCIDENTS:');
    
    report.activeIncidents
      .filter(i => i.severity === 'CRITICAL')
      .forEach(incident => {
        console.log(`  • ${incident.type}: ${incident.description}`);
        console.log(`    Time: ${incident.timestamp.toISOString()}`);
      });
    
    console.log('\nRECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
    console.log('='.repeat(50));
    console.log('Please review system status and take manual action if needed.');
    console.log('Run project-manager.getDetailedReport() for more information.\n');
    
    this.logger.logAlert('Human escalation triggered', 'CRITICAL', {
      systemStatus: report.systemStatus,
      activeIncidents: report.activeIncidents.length,
      recommendations: report.recommendations
    });
    
    this.notifications.notifyEscalation(report);
    this.emit('human_escalation', report);
  }

  public getSystemStatus(): ProjectManagerReport['systemStatus'] {
    const latestReport = this.reports[this.reports.length - 1];
    return latestReport?.systemStatus || 'DOWN';
  }

  public getLatestReport(): ProjectManagerReport | null {
    return this.reports[this.reports.length - 1] || null;
  }

  public getDetailedReport(): {
    system: ProjectManagerReport | null;
    monitoring: {
      health: ServerHealth;
      incidents: Incident[];
    };
    engineering: {
      activeIncidents: Incident[];
      fixHistory: FixAction[];
    };
  } {
    return {
      system: this.getLatestReport(),
      monitoring: {
        health: this.monitoringAgent.getHealthStatus(),
        incidents: this.monitoringAgent.getIncidents()
      },
      engineering: {
        activeIncidents: this.engineeringAgent.getActiveIncidents(),
        fixHistory: this.engineeringAgent.getFixHistory()
      }
    };
  }

  public getReports(limit = 10): ProjectManagerReport[] {
    return this.reports.slice(-limit);
  }

  public clearReports(): void {
    this.reports = [];
  }
}