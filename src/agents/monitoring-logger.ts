import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectManagerReport } from './project-manager';
import { Incident } from './monitoring-agent';
import { FixAction } from './incident-engineering-agent';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'DAEMON' | 'MONITORING' | 'ENGINEERING' | 'SYSTEM';
  message: string;
  data?: any;
}

export interface IncidentHistoryEntry {
  incident: Incident;
  fixes: FixAction[];
  resolution: 'AUTO_RESOLVED' | 'ESCALATED' | 'PENDING';
  totalDowntime?: number;
}

export class MonitoringLogger {
  private logsDir: string;
  private logFile: string;
  private incidentHistoryFile: string;
  private metricsFile: string;
  private maxLogFiles = 10;
  private maxLogSizeBytes = 10 * 1024 * 1024; // 10MB

  constructor(logsDir: string) {
    this.logsDir = logsDir;
    this.logFile = path.join(logsDir, 'monitor.log');
    this.incidentHistoryFile = path.join(logsDir, 'incidents.json');
    this.metricsFile = path.join(logsDir, 'metrics.json');
    
    this.ensureLogsDirectory();
  }

  private async ensureLogsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  public async logInfo(message: string, data?: any): Promise<void> {
    await this.writeLog('INFO', 'SYSTEM', message, data);
  }

  public async logWarning(message: string, data?: any): Promise<void> {
    await this.writeLog('WARNING', 'SYSTEM', message, data);
  }

  public async logError(message: string, error: Error, data?: any): Promise<void> {
    const errorData = {
      error: error.message,
      stack: error.stack,
      ...data
    };
    await this.writeLog('ERROR', 'SYSTEM', message, errorData);
  }

  public async logAlert(message: string, level: 'WARNING' | 'CRITICAL' = 'WARNING', data?: any): Promise<void> {
    await this.writeLog(level, 'MONITORING', message, data);
  }

  public async logIncident(incident: Incident): Promise<void> {
    await this.writeLog('WARNING', 'MONITORING', `New incident: ${incident.type}`, {
      incidentId: incident.id,
      severity: incident.severity,
      description: incident.description
    });
    
    await this.updateIncidentHistory(incident);
  }

  public async logFixAttempt(fix: FixAction): Promise<void> {
    const level = fix.success ? 'INFO' : 'ERROR';
    await this.writeLog(level, 'ENGINEERING', `Fix attempt: ${fix.action}`, {
      fixId: fix.id,
      incidentId: fix.incidentId,
      success: fix.success,
      error: fix.error,
      description: fix.description
    });

    await this.updateIncidentHistoryWithFix(fix);
  }

  public async logReport(report: ProjectManagerReport): Promise<void> {
    // Only log if status changed or there are active incidents
    if (report.systemStatus !== 'HEALTHY' || report.activeIncidents.length > 0) {
      await this.writeLog('INFO', 'SYSTEM', `System report: ${report.systemStatus}`, {
        systemStatus: report.systemStatus,
        activeIncidents: report.activeIncidents.length,
        serverRunning: report.serverHealth.isRunning,
        responseTime: report.serverHealth.responseTime,
        recommendations: report.recommendations
      });
    }

    await this.updateMetrics(report);
  }

  private async writeLog(level: LogEntry['level'], category: LogEntry['category'], message: string, data?: any): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    const logLine = this.formatLogEntry(entry);
    
    try {
      // Check if we need to rotate logs
      await this.rotateLogsIfNeeded();
      
      await fs.appendFile(this.logFile, logLine + '\n');
      
      // Also output to console for immediate visibility
      if (level === 'ERROR' || level === 'CRITICAL') {
        console.error(`[${entry.timestamp}] ${level}: ${message}`);
      } else if (level === 'WARNING') {
        console.warn(`[${entry.timestamp}] ${level}: ${message}`);
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const baseLog = `[${entry.timestamp}] ${entry.level} [${entry.category}] ${entry.message}`;
    
    if (entry.data) {
      return `${baseLog} | ${JSON.stringify(entry.data)}`;
    }
    
    return baseLog;
  }

  private async rotateLogsIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFile);
      
      if (stats.size > this.maxLogSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = path.join(this.logsDir, `monitor-${timestamp}.log`);
        
        await fs.rename(this.logFile, rotatedFile);
        
        // Clean up old log files
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.logsDir);
      const logFiles = files
        .filter(file => file.startsWith('monitor-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logsDir, file)
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort by name (timestamp) descending

      // Keep only the most recent log files
      for (let i = this.maxLogFiles; i < logFiles.length; i++) {
        await fs.unlink(logFiles[i].path);
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  private async updateIncidentHistory(incident: Incident): Promise<void> {
    try {
      let history: IncidentHistoryEntry[] = [];
      
      try {
        const historyData = await fs.readFile(this.incidentHistoryFile, 'utf-8');
        history = JSON.parse(historyData);
      } catch {
        // File doesn't exist yet
      }

      const entry: IncidentHistoryEntry = {
        incident,
        fixes: [],
        resolution: 'PENDING'
      };

      history.push(entry);

      // Keep only the last 1000 incidents
      if (history.length > 1000) {
        history = history.slice(-1000);
      }

      await fs.writeFile(this.incidentHistoryFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to update incident history:', error);
    }
  }

  private async updateIncidentHistoryWithFix(fix: FixAction): Promise<void> {
    try {
      const historyData = await fs.readFile(this.incidentHistoryFile, 'utf-8');
      const history: IncidentHistoryEntry[] = JSON.parse(historyData);

      const entry = history.find(h => h.incident.id === fix.incidentId);
      if (entry) {
        entry.fixes.push(fix);
        
        if (fix.success) {
          entry.resolution = 'AUTO_RESOLVED';
          entry.totalDowntime = Date.now() - entry.incident.timestamp.getTime();
        }
      }

      await fs.writeFile(this.incidentHistoryFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to update incident history with fix:', error);
    }
  }

  private async updateMetrics(report: ProjectManagerReport): Promise<void> {
    try {
      let metrics: any = {
        startTime: new Date().toISOString(),
        totalReports: 0,
        statusHistory: [],
        responseTimeHistory: [],
        incidentCounts: {
          total: 0,
          byType: {},
          bySeverity: {}
        },
        uptimePercentage: 100
      };

      try {
        const metricsData = await fs.readFile(this.metricsFile, 'utf-8');
        metrics = JSON.parse(metricsData);
      } catch {
        // File doesn't exist yet
      }

      metrics.totalReports++;
      metrics.lastUpdate = new Date().toISOString();

      // Add status to history (keep last 1000)
      metrics.statusHistory.push({
        timestamp: report.timestamp,
        status: report.systemStatus,
        serverRunning: report.serverHealth.isRunning
      });
      if (metrics.statusHistory.length > 1000) {
        metrics.statusHistory = metrics.statusHistory.slice(-1000);
      }

      // Add response time to history (keep last 1000)
      if (report.serverHealth.responseTime) {
        metrics.responseTimeHistory.push({
          timestamp: report.timestamp,
          responseTime: report.serverHealth.responseTime
        });
        if (metrics.responseTimeHistory.length > 1000) {
          metrics.responseTimeHistory = metrics.responseTimeHistory.slice(-1000);
        }
      }

      // Update incident counts
      report.activeIncidents.forEach(incident => {
        metrics.incidentCounts.total++;
        metrics.incidentCounts.byType[incident.type] = 
          (metrics.incidentCounts.byType[incident.type] || 0) + 1;
        metrics.incidentCounts.bySeverity[incident.severity] = 
          (metrics.incidentCounts.bySeverity[incident.severity] || 0) + 1;
      });

      // Calculate uptime percentage
      const healthyReports = metrics.statusHistory.filter((h: any) => h.serverRunning).length;
      metrics.uptimePercentage = metrics.statusHistory.length > 0 
        ? (healthyReports / metrics.statusHistory.length) * 100 
        : 100;

      await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  public async getRecentLogs(lines = 100): Promise<string[]> {
    try {
      const logData = await fs.readFile(this.logFile, 'utf-8');
      return logData.split('\n').filter(line => line.trim()).slice(-lines);
    } catch {
      return [];
    }
  }

  public async getIncidentHistory(limit = 50): Promise<IncidentHistoryEntry[]> {
    try {
      const historyData = await fs.readFile(this.incidentHistoryFile, 'utf-8');
      const history: IncidentHistoryEntry[] = JSON.parse(historyData);
      return history.slice(-limit);
    } catch {
      return [];
    }
  }

  public async getMetrics(): Promise<any> {
    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf-8');
      return JSON.parse(metricsData);
    } catch {
      return null;
    }
  }

  public async exportLogs(outputPath: string): Promise<void> {
    try {
      const logs = await this.getRecentLogs(10000);
      const incidents = await this.getIncidentHistory(1000);
      const metrics = await this.getMetrics();

      const exportData = {
        exportDate: new Date().toISOString(),
        logs,
        incidents,
        metrics
      };

      await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
    } catch (error) {
      throw new Error(`Failed to export logs: ${error}`);
    }
  }
}