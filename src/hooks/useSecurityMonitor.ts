import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}

export const useSecurityMonitor = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Use enhanced security logging instead of external IP service
      const { data, error } = await supabase.rpc('enhanced_log_security_event', {
        p_event_type: event.event_type,
        p_severity: event.severity,
        p_description: event.description,
        p_metadata: event.metadata || {}
      });

      if (error) {
        console.error('Error logging security event:', error);
        return;
      }

      return data;
    } catch (error) {
      console.error('Error logging security event:', error);
      // Don't throw - security logging shouldn't break the app
    }
  }, [user?.id]);

  const logFailedLogin = useCallback(async (email: string, reason: string) => {
    await logSecurityEvent({
      event_type: 'failed_login',
      severity: 'medium',
      description: `Intento de login fallido: ${reason}`,
      metadata: { email, reason }
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback(async (
    activity: string, 
    details: Record<string, any> = {}
  ) => {
    await logSecurityEvent({
      event_type: 'suspicious_activity',
      severity: 'high',
      description: `Actividad sospechosa detectada: ${activity}`,
      metadata: details
    });
  }, [logSecurityEvent]);

  const logUnauthorizedAccess = useCallback(async (
    resource: string,
    attemptedAction: string
  ) => {
    await logSecurityEvent({
      event_type: 'unauthorized_access',
      severity: 'high',
      description: `Acceso no autorizado a ${resource}`,
      metadata: { resource, attemptedAction }
    });
  }, [logSecurityEvent]);

  const logPrivilegeEscalation = useCallback(async (
    targetUserId: string,
    attemptedRole: string
  ) => {
    await logSecurityEvent({
      event_type: 'privilege_escalation_attempt',
      severity: 'critical',
      description: 'Intento de escalada de privilegios detectado',
      metadata: { targetUserId, attemptedRole }
    });
  }, [logSecurityEvent]);

  const logDataExfiltration = useCallback(async (
    dataType: string,
    recordCount: number
  ) => {
    await logSecurityEvent({
      event_type: 'potential_data_exfiltration',
      severity: 'critical',
      description: `Posible exfiltración de datos: ${dataType}`,
      metadata: { dataType, recordCount }
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logFailedLogin,
    logSuspiciousActivity,
    logUnauthorizedAccess,
    logPrivilegeEscalation,
    logDataExfiltration
  };
};