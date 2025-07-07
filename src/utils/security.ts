/**
 * Utilidades de seguridad para la aplicación
 */

// Headers de seguridad para responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://nbvvdaprcecaqvvkqcto.supabase.co wss://nbvvdaprcecaqvvkqcto.supabase.co; font-src 'self' data:;",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate Limiter simple para prevenir abuso
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Filtrar requests dentro de la ventana de tiempo
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    // Limpiar requests antiguos para evitar memory leaks
    this.cleanup();
    
    return true;
  }
  
  private cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hora
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Validación y sanitización de entrada
export const validateAndSanitize = {
  // Sanitizar texto para prevenir XSS
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remover tags básicos
      .replace(/javascript:/gi, '') // Remover javascript: URLs
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  },

  // Validar email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar URL
  validateUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Validar UUID
  validateUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Sanitizar nombre de archivo
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 255);
  }
};

// Gestión de secretos y configuración sensible
export const secretsManager = {
  // Verificar si estamos en un entorno seguro
  isSecureEnvironment: (): boolean => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },

  // Obtener configuración de forma segura
  getConfig: (key: string): string | null => {
    // En desarrollo, permitir variables de entorno
    if (import.meta.env.DEV) {
      return import.meta.env[key] || null;
    }
    
    // En producción, solo variables públicas
    if (key.startsWith('VITE_')) {
      return import.meta.env[key] || null;
    }
    
    return null;
  },

  // Verificar si una clave es sensible
  isSensitiveKey: (key: string): boolean => {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /private/i,
      /token/i,
      /key$/i,
      /auth/i,
      /credential/i
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(key));
  }
};

// Detector de anomalías simple
export class SecurityMonitor {
  private events: Array<{ type: string; timestamp: number; data?: any }> = [];
  
  recordEvent(type: string, data?: any) {
    this.events.push({
      type,
      timestamp: Date.now(),
      data
    });
    
    // Mantener solo los últimos 1000 eventos
    if (this.events.length > 1000) {
      this.events.splice(0, 100);
    }
    
    this.checkAnomalies();
  }
  
  private checkAnomalies() {
    const now = Date.now();
    const recentEvents = this.events.filter(e => now - e.timestamp < 60000); // Últimos 60 segundos
    
    // Detectar múltiples fallos de autenticación
    const authFailures = recentEvents.filter(e => e.type === 'auth_failure');
    if (authFailures.length > 5) {
      this.reportSuspiciousActivity('multiple_auth_failures', { count: authFailures.length });
    }
    
    // Detectar acceso a múltiples recursos en poco tiempo
    const resourceAccess = recentEvents.filter(e => e.type === 'resource_access');
    if (resourceAccess.length > 50) {
      this.reportSuspiciousActivity('rapid_resource_access', { count: resourceAccess.length });
    }
  }
  
  private reportSuspiciousActivity(type: string, data: any) {
    console.warn(`[SECURITY] Suspicious activity detected: ${type}`, data);
    // Aquí se podría enviar una alerta al sistema de monitoreo
  }
}

export const securityMonitor = new SecurityMonitor();

// Utilidades para CSP
export const cspUtils = {
  // Generar nonce para scripts inline
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },
  
  // Validar origen de solicitud
  validateOrigin: (origin: string, allowedOrigins: string[]): boolean => {
    return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }
};