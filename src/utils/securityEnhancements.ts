
/**
 * Mejoras adicionales de seguridad para la aplicación
 */

import { secureLogger } from './secureLogger';
import { securityMonitor } from './security';

export class SecurityEnhancements {
  private static instance: SecurityEnhancements;
  private securityEvents: Map<string, number> = new Map();

  static getInstance(): SecurityEnhancements {
    if (!SecurityEnhancements.instance) {
      SecurityEnhancements.instance = new SecurityEnhancements();
    }
    return SecurityEnhancements.instance;
  }

  /**
   * Monitor de intentos de acceso sospechosos
   */
  public monitorSuspiciousActivity(userId: string, action: string, context?: any) {
    const key = `${userId}-${action}`;
    const currentCount = this.securityEvents.get(key) || 0;
    const newCount = currentCount + 1;
    
    this.securityEvents.set(key, newCount);
    
    // Detectar actividad sospechosa
    if (newCount > 10) { // Más de 10 intentos en poco tiempo
      secureLogger.security('suspicious_activity_detected', 'high', {
        userId,
        action,
        attemptCount: newCount,
        context
      });
      
      this.triggerSecurityAlert(userId, action, newCount);
    }
    
    // Limpiar eventos antiguos cada 5 minutos
    if (Math.random() < 0.01) {
      this.cleanupOldEvents();
    }
  }

  /**
   * Validador de contenido HTML seguro
   */
  public validateHTMLContent(content: string): { safe: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Patrones peligrosos
    const dangerousPatterns = [
      { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, issue: 'Script tags detectados' },
      { pattern: /on\w+\s*=/gi, issue: 'Event handlers detectados' },
      { pattern: /javascript:/gi, issue: 'URLs JavaScript detectadas' },
      { pattern: /<iframe\b/gi, issue: 'iFrames detectados' },
      { pattern: /<object\b/gi, issue: 'Object tags detectados' },
      { pattern: /<embed\b/gi, issue: 'Embed tags detectados' },
      { pattern: /vbscript:/gi, issue: 'URLs VBScript detectadas' },
      { pattern: /<link\b/gi, issue: 'Link tags externos detectados' },
      { pattern: /<meta\b/gi, issue: 'Meta tags detectados' }
    ];

    dangerousPatterns.forEach(({ pattern, issue }) => {
      if (pattern.test(content)) {
        issues.push(issue);
      }
    });

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Encriptación simple para datos sensibles en localStorage
   */
  public encryptLocalData(data: string): string {
    // Implementación básica de ofuscación
    // En producción se debería usar una librería de encriptación robusta
    return btoa(data).split('').reverse().join('');
  }

  public decryptLocalData(encryptedData: string): string {
    try {
      return atob(encryptedData.split('').reverse().join(''));
    } catch (error) {
      secureLogger.error('Failed to decrypt local data', { encryptedData }, error as Error);
      return '';
    }
  }

  /**
   * Validador de URLs seguras
   */
  public validateURL(url: string): { valid: boolean; reason?: string } {
    try {
      const urlObj = new URL(url);
      
      // Solo permitir HTTPS en producción
      if (!import.meta.env.DEV && urlObj.protocol !== 'https:') {
        return { valid: false, reason: 'Solo se permiten URLs HTTPS' };
      }
      
      // Lista de dominios bloqueados
      const blockedDomains = [
        'malware-site.com',
        'phishing-example.com'
        // Añadir más dominios según sea necesario
      ];
      
      if (blockedDomains.includes(urlObj.hostname)) {
        return { valid: false, reason: 'Dominio bloqueado por seguridad' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'URL inválida' };
    }
  }

  /**
   * Detector de inyección SQL básico
   */
  public detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\\')|(;)|(--)|(\s+or\s+)|(\/\*)|(\*\/)|(\bUNION\b)|(\bSELECT\b)|(\bINSERT\b)|(\bDELETE\b)|(\bDROP\b)|(\bUPDATE\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  private triggerSecurityAlert(userId: string, action: string, attemptCount: number) {
    securityMonitor.recordEvent('security_alert_triggered', {
      userId,
      action,
      attemptCount,
      severity: 'high',
      timestamp: new Date().toISOString()
    });
    
    // Aquí se podría integrar con un sistema de alertas externo
    console.warn(`🚨 ALERTA DE SEGURIDAD: Usuario ${userId} - Acción ${action} - ${attemptCount} intentos`);
  }

  private cleanupOldEvents() {
    // En una implementación real, se almacenaría timestamp y se limpiarían eventos antiguos
    if (this.securityEvents.size > 1000) {
      this.securityEvents.clear();
    }
  }
}

export const securityEnhancements = SecurityEnhancements.getInstance();

/**
 * Middleware de seguridad para validar requests
 */
export const securityMiddleware = {
  validateRequest: (data: any, userId?: string) => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Datos de request inválidos' };
    }
    
    // Registrar intento de request
    if (userId) {
      securityEnhancements.monitorSuspiciousActivity(userId, 'api_request', { 
        dataKeys: Object.keys(data) 
      });
    }
    
    return { valid: true };
  },
  
  sanitizeResponse: (response: any) => {
    // Remover campos sensibles de las respuestas
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    if (typeof response === 'object' && response !== null) {
      const sanitized = { ...response };
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    }
    
    return response;
  }
};
