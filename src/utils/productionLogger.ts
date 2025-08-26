/**
 * Production Logger Utility
 * 
 * Centralized logging system for production environments
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  userId?: string;
  data?: any;
}

class ProductionLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  /**
   * Log debug information (development only)
   */
  debug(message: string, data?: any, component?: string): void {
    if (!this.isProduction) {
      console.log(`[DEBUG] ${message}`, data);
    }
    this.addLog('debug', message, component, data);
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any, component?: string): void {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, data);
    }
    this.addLog('info', message, component, data);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any, component?: string): void {
    console.warn(`[WARN] ${message}`, data);
    this.addLog('warn', message, component, data);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | any, component?: string): void {
    console.error(`[ERROR] ${message}`, error);
    this.addLog('error', message, component, error);
    
    // In production, could send to external logging service
    if (this.isProduction) {
      this.sendToExternalLogger('error', message, component, error);
    }
  }

  /**
   * Add log entry to internal storage
   */
  private addLog(level: LogLevel, message: string, component?: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component,
      data
    };

    this.logs.push(logEntry);

    // Maintain maximum log count
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Get recent logs
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = level ? this.logs.filter(log => log.level === level) : this.logs;
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send to external logging service (Sentry, LogRocket, etc.)
   */
  private async sendToExternalLogger(level: LogLevel, message: string, component?: string, data?: any): Promise<void> {
    try {
      // Example: Send to Sentry or similar service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ level, message, component, data, timestamp: new Date().toISOString() })
      // });
    } catch (error) {
      // Fallback to console if external logging fails
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Create component-specific logger
   */
  createComponentLogger(componentName: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, componentName),
      info: (message: string, data?: any) => this.info(message, data, componentName),
      warn: (message: string, data?: any) => this.warn(message, data, componentName),
      error: (message: string, error?: any) => this.error(message, error, componentName),
    };
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export component logger factory
export const createLogger = (componentName: string) => 
  logger.createComponentLogger(componentName);

// Export legacy compatibility (to replace console.log usage gradually)
export const devLog = logger.debug;
export const prodLog = logger.info;