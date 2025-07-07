/**
 * Sistema de logging seguro para producción
 * Previene la exposición de información sensible en logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;
  private sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'credential'];

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    let message = `${prefix} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      const sanitizedContext = this.sanitizeData(entry.context);
      message += ` | Context: ${JSON.stringify(sanitizedContext)}`;
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeData(context) : undefined,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    // En desarrollo, siempre log a consola
    if (this.isDevelopment) {
      switch (level) {
        case 'error':
          console.error(formattedMessage, error || '');
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
      }
    } else {
      // En producción, solo errores y warnings críticos
      if (level === 'error' || level === 'warn') {
        console[level](formattedMessage, error || '');
      }
    }

    // En producción, enviar a servicio de logging externo
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // Aquí se podría integrar con un servicio de logging como Sentry, LogRocket, etc.
      // Por ahora, mantener en estructura JSON para facilitar análisis
      if (typeof window !== 'undefined') {
        // En el cliente, almacenar en localStorage temporalmente
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(entry);
        // Mantener solo los últimos 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        localStorage.setItem('app_logs', JSON.stringify(logs));
      }
    } catch (error) {
      // Fallback silencioso para evitar loops de error
      console.error('Failed to send log to service:', error);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  // Método para logging de eventos de seguridad
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) {
    this.log('warn', `SECURITY EVENT: ${event}`, { 
      ...context, 
      severity,
      security_event: true 
    });
  }

  // Método para obtener logs almacenados (solo desarrollo)
  getLogs(): LogEntry[] {
    if (this.isDevelopment && typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    }
    return [];
  }

  // Método para limpiar logs almacenados
  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }
}

export const secureLogger = new SecureLogger();