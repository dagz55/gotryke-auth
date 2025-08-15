#!/usr/bin/env node

import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MonitoringLogger } from './monitoring-logger';

class MonitoringDashboard {
  private server: http.Server;
  private logger: MonitoringLogger;
  private port = 9003;
  private statusFile: string;

  constructor() {
    const logsDir = path.join(process.cwd(), '.gotryke', 'monitoring');
    this.logger = new MonitoringLogger(logsDir);
    this.statusFile = path.join(logsDir, 'status.json');
    
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = req.url || '/';
    
    try {
      switch (url) {
        case '/':
          await this.serveHTML(res);
          break;
        case '/api/status':
          await this.serveStatus(res);
          break;
        case '/api/logs':
          await this.serveLogs(res);
          break;
        case '/api/incidents':
          await this.serveIncidents(res);
          break;
        case '/api/metrics':
          await this.serveMetrics(res);
          break;
        default:
          res.writeHead(404);
          res.end('Not Found');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }

  private async serveHTML(res: http.ServerResponse): Promise<void> {
    const html = this.generateHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  private async serveStatus(res: http.ServerResponse): Promise<void> {
    try {
      const status = await fs.readFile(this.statusFile, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(status);
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Monitoring daemon not running' }));
    }
  }

  private async serveLogs(res: http.ServerResponse): Promise<void> {
    const logs = await this.logger.getRecentLogs(100);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ logs }));
  }

  private async serveIncidents(res: http.ServerResponse): Promise<void> {
    const incidents = await this.logger.getIncidentHistory(50);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ incidents }));
  }

  private async serveMetrics(res: http.ServerResponse): Promise<void> {
    const metrics = await this.logger.getMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
  }

  private generateHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoTryke Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            background: #f5f5f7;
            color: #1d1d1f;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2.5rem; font-weight: 600; margin-bottom: 10px; }
        .header .subtitle { color: #86868b; font-size: 1.2rem; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .card h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 16px; }
        
        .status-healthy { color: #30d158; }
        .status-degraded { color: #ff9f0a; }
        .status-critical { color: #ff453a; }
        .status-down { color: #ff453a; font-weight: 600; }
        
        .metric { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; }
        .metric-label { color: #86868b; }
        .metric-value { font-weight: 600; }
        
        .logs { max-height: 400px; overflow-y: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 0.9rem; }
        .log-entry { padding: 8px; border-bottom: 1px solid #f0f0f0; }
        .log-error { background: #fff2f2; color: #d70015; }
        .log-warning { background: #fffbf0; color: #bf5f00; }
        
        .incident-list { max-height: 300px; overflow-y: auto; }
        .incident { padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid; }
        .incident-critical { background: #fff2f2; border-left-color: #ff453a; }
        .incident-high { background: #fffbf0; border-left-color: #ff9f0a; }
        .incident-medium { background: #f0f9ff; border-left-color: #007aff; }
        .incident-resolved { opacity: 0.6; }
        
        .refresh-btn {
            background: #007aff;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .refresh-btn:hover { background: #0056cc; }
        
        .last-updated { text-align: center; margin-top: 20px; color: #86868b; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GoTryke Monitoring Dashboard</h1>
            <div class="subtitle">Real-time development server monitoring</div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>System Status</h3>
                <div id="system-status">
                    <div class="metric">
                        <span class="metric-label">Status</span>
                        <span class="metric-value" id="status-value">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Server Running</span>
                        <span class="metric-value" id="server-status">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Response Time</span>
                        <span class="metric-value" id="response-time">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Uptime</span>
                        <span class="metric-value" id="uptime">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Active Incidents</span>
                        <span class="metric-value" id="active-incidents">Loading...</span>
                    </div>
                </div>
                <button class="refresh-btn" onclick="refreshData()">Refresh</button>
            </div>

            <div class="card">
                <h3>Recent Incidents</h3>
                <div id="incidents-list" class="incident-list">
                    Loading incidents...
                </div>
            </div>

            <div class="card">
                <h3>Performance Metrics</h3>
                <div id="metrics">
                    <div class="metric">
                        <span class="metric-label">Uptime Percentage</span>
                        <span class="metric-value" id="uptime-percentage">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Total Reports</span>
                        <span class="metric-value" id="total-reports">Loading...</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Total Incidents</span>
                        <span class="metric-value" id="total-incidents">Loading...</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>Recent Logs</h3>
                <div id="logs" class="logs">
                    Loading logs...
                </div>
            </div>
        </div>

        <div class="last-updated" id="last-updated">
            Last updated: Never
        </div>
    </div>

    <script>
        async function fetchData(endpoint) {
            try {
                const response = await fetch(\`/api/\${endpoint}\`);
                return await response.json();
            } catch (error) {
                console.error(\`Failed to fetch \${endpoint}:\`, error);
                return null;
            }
        }

        function getStatusClass(status) {
            switch (status) {
                case 'HEALTHY': return 'status-healthy';
                case 'DEGRADED': return 'status-degraded';
                case 'CRITICAL': return 'status-critical';
                case 'DOWN': return 'status-down';
                default: return '';
            }
        }

        function formatUptime(uptime) {
            const seconds = Math.floor(uptime / 1000);
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return \`\${hours}h \${minutes}m \${secs}s\`;
        }

        async function updateStatus() {
            const status = await fetchData('status');
            if (status && status.system) {
                const system = status.system;
                const daemon = status.daemon;
                
                document.getElementById('status-value').textContent = system.systemStatus;
                document.getElementById('status-value').className = \`metric-value \${getStatusClass(system.systemStatus)}\`;
                
                document.getElementById('server-status').textContent = system.serverHealth.isRunning ? '✅ Running' : '❌ Down';
                document.getElementById('response-time').textContent = system.serverHealth.responseTime ? 
                    \`\${system.serverHealth.responseTime}ms\` : 'N/A';
                document.getElementById('uptime').textContent = formatUptime(daemon.uptime);
                document.getElementById('active-incidents').textContent = system.activeIncidents.length;
            } else {
                document.getElementById('status-value').textContent = 'Daemon Not Running';
                document.getElementById('status-value').className = 'metric-value status-down';
            }
        }

        async function updateIncidents() {
            const data = await fetchData('incidents');
            if (data && data.incidents) {
                const incidentsHtml = data.incidents.slice(-10).reverse().map(entry => {
                    const incident = entry.incident;
                    const severityClass = \`incident-\${incident.severity.toLowerCase()}\`;
                    const resolvedClass = incident.resolved ? 'incident-resolved' : '';
                    const status = incident.resolved ? '✅' : '🚨';
                    
                    return \`
                        <div class="incident \${severityClass} \${resolvedClass}">
                            <div><strong>\${status} \${incident.type}</strong> (\${incident.severity})</div>
                            <div>\${incident.description}</div>
                            <div style="font-size: 0.8em; color: #86868b; margin-top: 4px;">
                                \${new Date(incident.timestamp).toLocaleString()}
                            </div>
                        </div>
                    \`;
                }).join('');
                
                document.getElementById('incidents-list').innerHTML = incidentsHtml || 'No incidents recorded';
            }
        }

        async function updateMetrics() {
            const metrics = await fetchData('metrics');
            if (metrics) {
                document.getElementById('uptime-percentage').textContent = 
                    \`\${metrics.uptimePercentage?.toFixed(2) || 0}%\`;
                document.getElementById('total-reports').textContent = metrics.totalReports || 0;
                document.getElementById('total-incidents').textContent = metrics.incidentCounts?.total || 0;
            }
        }

        async function updateLogs() {
            const data = await fetchData('logs');
            if (data && data.logs) {
                const logsHtml = data.logs.slice(-20).map(log => {
                    let logClass = '';
                    if (log.includes('ERROR') || log.includes('CRITICAL')) logClass = 'log-error';
                    else if (log.includes('WARNING')) logClass = 'log-warning';
                    
                    return \`<div class="log-entry \${logClass}">\${log}</div>\`;
                }).join('');
                
                document.getElementById('logs').innerHTML = logsHtml || 'No logs available';
            }
        }

        async function refreshData() {
            await Promise.all([
                updateStatus(),
                updateIncidents(),
                updateMetrics(),
                updateLogs()
            ]);
            
            document.getElementById('last-updated').textContent = 
                \`Last updated: \${new Date().toLocaleTimeString()}\`;
        }

        // Initial load
        refreshData();

        // Auto-refresh every 10 seconds
        setInterval(refreshData, 10000);
    </script>
</body>
</html>
    `;
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`📊 GoTryke Monitoring Dashboard running at http://localhost:${this.port}`);
      console.log('Open this URL in your browser to view the monitoring dashboard');
    });

    this.server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${this.port} is in use, trying ${this.port + 1}...`);
        this.port++;
        this.server.listen(this.port);
      } else {
        console.error('Dashboard server error:', error);
      }
    });
  }

  public stop(): void {
    this.server.close();
  }
}

// CLI interface
const dashboard = new MonitoringDashboard();
dashboard.start();

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard...');
  dashboard.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  dashboard.stop();
  process.exit(0);
});