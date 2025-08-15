# GoTryke Development Server Monitoring System

A comprehensive monitoring solution with three specialized agents that work together to ensure the GoTryke development server stays healthy and automatically resolves issues.

## Architecture

### 🤖 Monitoring Agent
- **Purpose**: Continuously monitors dev server health
- **Monitors**: Server availability, response times, connection issues
- **Frequency**: Health checks every 10 seconds
- **Alerts**: Creates incidents when issues are detected

### 🔧 Incident Engineering Agent
- **Purpose**: Automatically diagnose and fix detected issues
- **Capabilities**: 
  - Server restart and recovery
  - Dependency installation
  - Process management
  - Build error resolution
- **Auto-fix**: Handles common issues without human intervention

### 📋 Project Manager
- **Purpose**: Coordinates agents and escalates to humans when needed
- **Features**:
  - System status reporting
  - Incident tracking and history
  - Automatic escalation for critical issues
  - Performance recommendations

### 🔔 Notification Service
- **Purpose**: Real-time alerts and notifications
- **Features**:
  - Desktop notifications (macOS, Linux, Windows)
  - Sound alerts for different severity levels
  - Configurable notification preferences

### 📝 Persistent Logging
- **Purpose**: Long-term monitoring data and analysis
- **Features**:
  - Structured logging with rotation
  - Incident history tracking
  - Performance metrics collection
  - Export capabilities for analysis

## Production Monitoring

### Quick Setup

```bash
# 1. One-time setup
npm run monitor:setup

# 2. Start your dev server (in one terminal)
npm run dev

# 3. Start monitoring daemon (in another terminal)  
npm run monitor:daemon start

# 4. Open monitoring dashboard (optional)
npm run monitor:dashboard
# Then visit http://localhost:9003
```

### Production Commands

**Daemon Management:**
```bash
npm run monitor:daemon start    # Start monitoring daemon
npm run monitor:daemon status   # Check daemon status
npm run monitor:daemon stop     # Stop monitoring daemon
npm run monitor:daemon logs     # View recent logs
```

**Dashboard & Testing:**
```bash
npm run monitor:dashboard       # Start web dashboard (http://localhost:9003)
npm run monitor:notify test     # Test notifications
npm run monitor:test           # Quick monitoring test
```

### Interactive CLI (Development)
```bash
npm run monitor
```

This opens an interactive CLI where you can:
- `start` - Begin monitoring the dev server
- `status` - Check current system health
- `report` - View detailed system information
- `history` - See recent incident reports
- `help` - Show all available commands

### Quick Test
```bash
npm run monitor:test
```

Runs a 60-second test to verify the monitoring system works.

### Programmatic Usage
```typescript
import { ProjectManager } from './src/agents';

const projectManager = new ProjectManager();

projectManager.on('human_escalation', (report) => {
  console.log('Manual intervention required!');
  console.log(report);
});

projectManager.startSystem();
```

## Incident Types

- **SERVER_DOWN**: Dev server not responding or crashed
- **SLOW_RESPONSE**: Response times > 3 seconds
- **BUILD_ERROR**: Compilation or dependency issues
- **CRASH**: Unexpected application termination

## Automatic Fixes

The system can automatically handle:

1. **Server Restart**: Kills hung processes and restarts dev server
2. **Dependency Issues**: Runs `npm install` and restarts
3. **Port Conflicts**: Identifies and kills processes blocking port 9002
4. **Build Recovery**: Clears cache and reinstalls dependencies

## Escalation

Human escalation occurs when:
- 3 or more automatic fixes fail within 10 minutes
- Critical incidents persist for more than 5 minutes
- System status remains critical despite fix attempts

## Configuration

The system monitors:
- **Port**: 9002 (GoTryke dev server)
- **Health Check Interval**: 10 seconds
- **Response Timeout**: 5 seconds
- **Escalation Threshold**: 3 failed fixes

## Files

- `monitoring-agent.ts` - Health monitoring and incident detection
- `incident-engineering-agent.ts` - Automatic issue resolution
- `project-manager.ts` - System coordination and reporting
- `monitor-cli.ts` - Interactive command-line interface
- `test-monitor.ts` - System verification test

## Integration

The monitoring system is designed to run alongside your development workflow:

1. Start your dev server: `npm run dev`
2. In another terminal, start monitoring: `npm run monitor`
3. Type `start` to begin monitoring
4. The system will automatically detect and fix issues

## Logs and Reporting

All activities are logged with timestamps and severity levels. The Project Manager provides:

- Real-time system status
- Incident history with resolution details
- Performance metrics and trends
- Actionable recommendations for system improvement