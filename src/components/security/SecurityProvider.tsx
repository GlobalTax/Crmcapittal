import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useValoracionSecurity } from '@/hooks/useValoracionSecurity';
import { useSecurityEnhanced } from '@/hooks/useSecurityEnhanced';
import { rateLimiter } from '@/utils/rateLimit';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  sanitizeInput: (input: string, options?: any) => string;
  validateEmail: (email: string) => boolean;
  validateUrl: (url: string) => boolean;
  logSecurityEvent: (type: string, description: string, metadata?: any) => Promise<void>;
  checkRateLimit: (operation: string, identifier: string) => Promise<boolean>;
  isSecureEnvironment: boolean;
  // Enhanced security features
  validateInputEnhanced: (input: string, type?: 'text' | 'email' | 'url') => Promise<string>;
  validateSession: () => Promise<any>;
  runSecurityAudit: () => Promise<any>;
  securityMetrics: any;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecureEnvironment, setIsSecureEnvironment] = useState(false);
  const { sanitizeInput, validateEmail, validateUrl } = useSecureInput();
  const { logSecurityEvent } = useValoracionSecurity();
  const { 
    validateInputEnhanced, 
    validateSession, 
    runSecurityAudit, 
    securityMetrics,
    logSecurityEvent: logEnhancedSecurityEvent
  } = useSecurityEnhanced();

  useEffect(() => {
    // Check if running in secure environment
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';
    
    setIsSecureEnvironment(isSecure);

    // Log security initialization
    if (isSecure) {
      logSecurityEvent(
        'security_initialized',
        'Security context initialized successfully',
        { 
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          protocol: window.location.protocol,
          hostname: window.location.hostname
        },
        'medium'
      );
    } else {
      console.warn('Application running in insecure environment');
    }
  }, [logSecurityEvent]);

  const checkRateLimit = async (operation: string, identifier: string): Promise<boolean> => {
    const config = {
      login: { maxRequests: 5, windowMinutes: 15 },
      signup: { maxRequests: 3, windowMinutes: 60 },
      api: { maxRequests: 100, windowMinutes: 1 },
      upload: { maxRequests: 10, windowMinutes: 1 }
    }[operation] || { maxRequests: 50, windowMinutes: 1 };

    try {
      // Fallback to local rate limiting for now (database function needs proper parameters)
      return rateLimiter.isAllowed({
        windowMs: config.windowMinutes * 60 * 1000,
        maxRequests: config.maxRequests,
        identifier: `${operation}:${identifier}`
      });
    } catch (error) {
      console.error('Enhanced rate limit check failed:', error);
      // Fallback to local rate limiting
      return rateLimiter.isAllowed({
        windowMs: config.windowMinutes * 60 * 1000,
        maxRequests: config.maxRequests,
        identifier: `${operation}:${identifier}`
      });
    }
  };

  const value: SecurityContextType = {
    sanitizeInput,
    validateEmail,
    validateUrl,
    logSecurityEvent: async (type: string, description: string, metadata?: any) => {
      // Use enhanced security logging
      await logEnhancedSecurityEvent(type, 'medium', description, metadata || {});
    },
    checkRateLimit,
    isSecureEnvironment,
    // Enhanced security features
    validateInputEnhanced,
    validateSession,
    runSecurityAudit,
    securityMetrics
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};