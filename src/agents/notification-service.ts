import { spawn } from 'child_process';
import { Incident } from './monitoring-agent';
import { ProjectManagerReport } from './project-manager';

export interface NotificationConfig {
  desktop: boolean;
  sound: boolean;
  critical: boolean;
  escalation: boolean;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = {
      desktop: true,
      sound: true,
      critical: true,
      escalation: true,
      ...config
    };
  }

  public notifyIncident(incident: Incident): void {
    if (!this.config.critical || incident.severity === 'LOW') {
      return;
    }

    const title = `GoTryke Alert: ${incident.type}`;
    const message = `${incident.severity} - ${incident.description}`;
    
    this.sendDesktopNotification(title, message, this.getSeveritySound(incident.severity));
  }

  public notifyEscalation(report: ProjectManagerReport): void {
    if (!this.config.escalation) {
      return;
    }

    const title = 'GoTryke: Manual Intervention Required';
    const message = `System status: ${report.systemStatus}. ${report.activeIncidents.length} active incidents require attention.`;
    
    this.sendDesktopNotification(title, message, 'Glass', true);
  }

  public notifyRecovery(incidentType: string): void {
    const title = 'GoTryke: System Recovered';
    const message = `${incidentType} incident has been resolved automatically.`;
    
    this.sendDesktopNotification(title, message, 'Blow');
  }

  public notifyDaemonStart(): void {
    if (!this.config.desktop) {
      return;
    }

    this.sendDesktopNotification(
      'GoTryke Monitoring',
      'Monitoring daemon started successfully',
      'Blow'
    );
  }

  public notifyDaemonStop(): void {
    if (!this.config.desktop) {
      return;
    }

    this.sendDesktopNotification(
      'GoTryke Monitoring',
      'Monitoring daemon stopped',
      'Purr'
    );
  }

  private getSeveritySound(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'Glass';
      case 'HIGH': return 'Sosumi';
      case 'MEDIUM': return 'Ping';
      default: return 'Pop';
    }
  }

  private sendDesktopNotification(title: string, message: string, sound = 'Glass', critical = false): void {
    if (!this.config.desktop) {
      return;
    }

    try {
      if (process.platform === 'darwin') {
        // macOS notification
        const soundOption = this.config.sound ? ` sound name "${sound}"` : '';
        const script = `display notification "${message}" with title "${title}"${soundOption}`;
        
        spawn('osascript', ['-e', script], {
          stdio: 'ignore',
          detached: true
        }).unref();
        
      } else if (process.platform === 'linux') {
        // Linux notification using notify-send
        const urgency = critical ? 'critical' : 'normal';
        spawn('notify-send', [
          '--urgency', urgency,
          '--app-name', 'GoTryke',
          title,
          message
        ], {
          stdio: 'ignore',
          detached: true
        }).unref();
        
      } else if (process.platform === 'win32') {
        // Windows notification using PowerShell
        const script = `
          Add-Type -AssemblyName System.Windows.Forms
          $notification = New-Object System.Windows.Forms.NotifyIcon
          $notification.Icon = [System.Drawing.SystemIcons]::Information
          $notification.BalloonTipTitle = "${title}"
          $notification.BalloonTipText = "${message}"
          $notification.Visible = $true
          $notification.ShowBalloonTip(5000)
        `;
        
        spawn('powershell', ['-Command', script], {
          stdio: 'ignore',
          detached: true,
          windowsHide: true
        }).unref();
      }
      
      // Always log to console as fallback
      console.log(`\n🔔 ${title}: ${message}`);
      
    } catch (error) {
      // Fallback to console output
      console.log(`\n🔔 ${title}: ${message}`);
    }
  }

  public updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Test notification
  public testNotifications(): void {
    console.log('🧪 Testing notification system...');
    
    this.sendDesktopNotification(
      'GoTryke Monitoring Test',
      'This is a test notification. If you can see this, notifications are working!',
      'Blow'
    );
    
    setTimeout(() => {
      this.sendDesktopNotification(
        'GoTryke Critical Test',
        'This is a critical alert test.',
        'Glass',
        true
      );
    }, 2000);
  }
}

// CLI test interface
if (require.main === module) {
  const notificationService = new NotificationService();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      notificationService.testNotifications();
      break;
      
    case 'critical':
      notificationService.notifyIncident({
        id: 'test-001',
        type: 'SERVER_DOWN',
        severity: 'CRITICAL',
        description: 'Test critical incident',
        timestamp: new Date(),
        resolved: false
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx tsx src/agents/notification-service.ts test      - Test notifications');
      console.log('  npx tsx src/agents/notification-service.ts critical - Test critical alert');
  }
}