import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  recentEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
}

interface SessionInfo {
  isValid: boolean;
  expiresAt?: Date;
  role?: string;
  lastActivity?: Date;
}

export const useSecurityEnhanced = () => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    recentEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0
  });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({ isValid: true });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Enhanced input validation with multiple security layers
  const validateInputEnhanced = useCallback(async (input: string, type: 'text' | 'email' | 'url' = 'text') => {
    try {
      // Use server-side validation
      const { data, error } = await supabase.rpc('validate_input_security', {
        input_text: input
      });

      if (error) {
        throw new Error(error.message);
      }

      // Additional client-side validation based on type
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            throw new Error('Formato de email inválido');
          }
          break;
        case 'url':
          try {
            new URL(input);
          } catch {
            throw new Error('URL inválida');
          }
          break;
      }

      return data;
    } catch (error) {
      // Log validation failure
      await logSecurityEvent('input_validation_failed', 'medium', error.message, {
        input_type: type,
        input_length: input.length
      });
      throw error;
    }
  }, []);

  // Enhanced rate limiting check
  const checkRateLimit = useCallback(async (
    operation: string, 
    maxRequests: number = 50, 
    windowMinutes: number = 1
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit_enhanced', {
        p_operation: operation,
        p_identifier: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false; // Fail secure - deny if check fails
    }
  }, []);

  // Log security events with enhanced metadata
  const logSecurityEvent = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      // Add browser and system information
      const enhancedMetadata = {
        ...metadata,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID() // Generate session identifier
      };

      await supabase.rpc('enhanced_log_security_event', {
        p_event_type: eventType,
        p_severity: severity,
        p_description: description,
        p_metadata: enhancedMetadata
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  // Validate current session with enhanced checks
  const validateSession = useCallback(async (): Promise<SessionInfo> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        return { isValid: false };
      }

      // Check server-side session validation
      const { data: isValid, error: validationError } = await supabase.rpc('validate_session_security');
      
      if (validationError) {
        console.error('Session validation error:', validationError);
        return { isValid: false };
      }

      if (!isValid) {
        await logSecurityEvent('session_invalid', 'high', 'Sesión inválida detectada');
        return { isValid: false };
      }

      // Get user role for session info
      const { data: userRole } = await supabase.rpc('get_current_user_role_safe');

      const sessionInfo: SessionInfo = {
        isValid: true,
        expiresAt: new Date(session.expires_at! * 1000),
        role: userRole,
        lastActivity: new Date()
      };

      setSessionInfo(sessionInfo);
      return sessionInfo;
    } catch (error) {
      console.error('Session validation failed:', error);
      await logSecurityEvent('session_validation_error', 'high', 'Error validando sesión', {
        error: error.message
      });
      return { isValid: false };
    }
  }, [logSecurityEvent]);

  // Load security metrics
  const loadSecurityMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // Get security events from last 24 hours
      const { data: events, error } = await supabase
        .from('security_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const metrics: SecurityMetrics = {
        totalEvents: events?.length || 0,
        criticalEvents: events?.filter(e => e.severity === 'critical').length || 0,
        recentEvents: events?.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 60 * 60 * 1000)
        ).length || 0,
        failedLogins: events?.filter(e => e.event_type.includes('failed_login')).length || 0,
        suspiciousActivity: events?.filter(e => 
          e.event_type.includes('suspicious') || e.event_type.includes('unauthorized')
        ).length || 0
      };

      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
      toast({
        title: 'Error de Seguridad',
        description: 'No se pudieron cargar las métricas de seguridad',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Run comprehensive security audit
  const runSecurityAudit = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('run_security_audit');
      
      if (error) throw error;
      
      await logSecurityEvent('security_audit_requested', 'low', 'Auditoría de seguridad ejecutada');
      
      return data;
    } catch (error) {
      console.error('Security audit failed:', error);
      await logSecurityEvent('security_audit_failed', 'high', 'Falló la auditoría de seguridad', {
        error: error.message
      });
      throw error;
    }
  }, [logSecurityEvent]);

  // Monitor for suspicious activity patterns
  const monitorActivity = useCallback(async (activity: string, context: Record<string, any> = {}) => {
    const suspiciousPatterns = [
      'rapid_requests',
      'unusual_location',
      'privilege_escalation_attempt',
      'data_exfiltration_pattern',
      'brute_force_attempt'
    ];

    if (suspiciousPatterns.some(pattern => activity.includes(pattern))) {
      await logSecurityEvent('suspicious_activity_detected', 'high', 
        `Actividad sospechosa detectada: ${activity}`, context);
      
      toast({
        title: 'Actividad Sospechosa',
        description: 'Se ha detectado actividad inusual. Verifica tu cuenta.',
        variant: 'destructive'
      });
    }
  }, [logSecurityEvent, toast]);

  // Auto-refresh session validation every 5 minutes
  useEffect(() => {
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [validateSession]);

  // Load initial metrics
  useEffect(() => {
    loadSecurityMetrics();
  }, [loadSecurityMetrics]);

  return {
    securityMetrics,
    sessionInfo,
    loading,
    validateInputEnhanced,
    checkRateLimit,
    logSecurityEvent,
    validateSession,
    loadSecurityMetrics,
    runSecurityAudit,
    monitorActivity
  };
};