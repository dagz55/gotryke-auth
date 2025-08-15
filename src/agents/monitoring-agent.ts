import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { MonitoringLogger } from './monitoring-logger';

export interface ServerHealth {
  isRunning: boolean;
  port: number;
  lastCheck: Date;
  responseTime?: number;
  errors: string[];
}

export interface Incident {
  id: string;
  type: 'SERVER_DOWN' | 'SLOW_RESPONSE' | 'BUILD_ERROR' | 'CRASH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export class MonitoringAgent extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private incidents: Incident[] = [];
  private isMonitoring = false;
  private readonly port = 9002;
  private logger?: MonitoringLogger;
  private lastHealthCheck: ServerHealth = {
    isRunning: false,
    port: this.port,
    lastCheck: new Date(),
    errors: []
  };

  constructor(logger?: MonitoringLogger) {
    super();
    this.logger = logger;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('incident', (incident: Incident) => {
      this.incidents.push(incident);
      this.logger?.logIncident(incident);
      this.notifyProjectManager(incident);
    });

    this.on('incident_resolved', (incidentId: string) => {
      const incident = this.incidents.find(i => i.id === incidentId);
      if (incident) {
        incident.resolved = true;
        this.logger?.logInfo(`Incident resolved: ${incidentId}`, { incidentId, type: incident.type });
        this.notifyProjectManager({ type: 'RESOLVED', incidentId });
      }
    });
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('Monitoring Agent: Already monitoring');
      return;
    }

    this.isMonitoring = true;
    console.log('Monitoring Agent: Starting server monitoring...');

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000); // Check every 10 seconds

    this.performHealthCheck();
  }

  public stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
    console.log('Monitoring Agent: Stopped monitoring');
  }

  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://localhost:${this.port}`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      this.lastHealthCheck = {
        isRunning: isHealthy,
        port: this.port,
        lastCheck: new Date(),
        responseTime,
        errors: isHealthy ? [] : [`HTTP ${response.status}: ${response.statusText}`]
      };

      if (!isHealthy) {
        this.createIncident('SERVER_DOWN', 'CRITICAL', `Server responded with ${response.status}`);
      } else if (responseTime > 3000) {
        this.createIncident('SLOW_RESPONSE', 'MEDIUM', `Slow response time: ${responseTime}ms`);
      } else {
        this.resolveIncidents(['SERVER_DOWN', 'SLOW_RESPONSE']);
      }

    } catch (error) {
      this.lastHealthCheck = {
        isRunning: false,
        port: this.port,
        lastCheck: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };

      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        this.createIncident('SERVER_DOWN', 'CRITICAL', 'Server is not responding (ECONNREFUSED)');
      } else {
        this.createIncident('SERVER_DOWN', 'CRITICAL', `Health check failed: ${error}`);
      }
    }
  }

  private createIncident(type: Incident['type'], severity: Incident['severity'], description: string): void {
    const existingIncident = this.incidents.find(i => 
      i.type === type && !i.resolved && 
      Date.now() - i.timestamp.getTime() < 60000 // Don't create duplicate incidents within 1 minute
    );

    if (existingIncident) {
      return;
    }

    const incident: Incident = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      description,
      timestamp: new Date(),
      resolved: false
    };

    this.emit('incident', incident);
  }

  private resolveIncidents(types: Incident['type'][]): void {
    const unresolvedIncidents = this.incidents.filter(i => 
      types.includes(i.type) && !i.resolved
    );

    unresolvedIncidents.forEach(incident => {
      this.emit('incident_resolved', incident.id);
    });
  }

  private notifyProjectManager(data: any): void {
    console.log('\n=== PROJECT MANAGER NOTIFICATION ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    if (data.type === 'RESOLVED') {
      console.log(`✅ INCIDENT RESOLVED: ${data.incidentId}`);
    } else {
      console.log(`🚨 NEW INCIDENT DETECTED:`);
      console.log(`  Type: ${data.type}`);
      console.log(`  Severity: ${data.severity}`);
      console.log(`  Description: ${data.description}`);
      console.log(`  Incident ID: ${data.id}`);
      console.log('\n📞 ESCALATING TO INCIDENT ENGINEERING AGENT...');
    }
    console.log('=====================================\n');
  }

  public getHealthStatus(): ServerHealth {
    return { ...this.lastHealthCheck };
  }

  public getIncidents(): Incident[] {
    return [...this.incidents];
  }

  public getActiveIncidents(): Incident[] {
    return this.incidents.filter(i => !i.resolved);
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id);
  }
}