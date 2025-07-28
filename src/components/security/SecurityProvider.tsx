import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useValoracionSecurity } from '@/hooks/useValoracionSecurity';
import { rateLimiter } from '@/utils/rateLimit';

interface SecurityContextType {
  sanitizeInput: (input: string, options?: any) => string;
  validateEmail: (email: string) => boolean;
  validateUrl: (url: string) => boolean;
  logSecurityEvent: (type: string, description: string, metadata?: any) => Promise<void>;
  checkRateLimit: (operation: string, identifier: string) => boolean;
  isSecureEnvironment: boolean;
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

  const checkRateLimit = (operation: string, identifier: string): boolean => {
    const config = {
      login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
      signup: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
      api: { windowMs: 60 * 1000, maxRequests: 100 },
      upload: { windowMs: 60 * 1000, maxRequests: 10 }
    }[operation] || { windowMs: 60 * 1000, maxRequests: 50 };

    return rateLimiter.isAllowed({
      ...config,
      identifier: `${operation}:${identifier}`
    });
  };

  const value: SecurityContextType = {
    sanitizeInput,
    validateEmail,
    validateUrl,
    logSecurityEvent: async (type: string, description: string, metadata?: any) => {
      await logSecurityEvent('', type, metadata || {}, 'medium');
    },
    checkRateLimit,
    isSecureEnvironment
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};