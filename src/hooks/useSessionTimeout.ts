import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitor } from './useSecurityMonitor';
import { toast } from 'sonner';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const { 
    timeoutMinutes = 60, 
    warningMinutes = 5, 
    enabled = true 
  } = options;
  
  const { logSecurityEvent } = useSecurityMonitor();

  const checkSessionTimeout = useCallback(async () => {
    if (!enabled) return true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_session_timeout', {
        p_user_id: user.id,
        p_timeout_minutes: timeoutMinutes
      });

      if (error) {
        console.warn('Session timeout check failed:', error);
        return true; // Assume session is valid if check fails
      }

      if (!data) {
        // Session has timed out
        await logSecurityEvent({
          event_type: 'session_timeout_forced',
          severity: 'medium',
          description: 'User session timed out and user was logged out',
          metadata: {
            timeout_minutes: timeoutMinutes,
            auto_logout: true
          }
        });

        toast.error('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session timeout check error:', error);
      return true; // Don't logout on errors
    }
  }, [enabled, timeoutMinutes, logSecurityEvent]);

  const showTimeoutWarning = useCallback(() => {
    toast.warning(
      `Tu sesión expirará en ${warningMinutes} minutos por inactividad. Realiza alguna acción para mantenerla activa.`,
      {
        duration: 10000,
        action: {
          label: 'Mantener activa',
          onClick: () => {
            // Simple activity to refresh session
            supabase.auth.getUser();
          }
        }
      }
    );
  }, [warningMinutes]);

  useEffect(() => {
    if (!enabled) return;

    // Check session timeout every 5 minutes
    const timeoutInterval = setInterval(checkSessionTimeout, 5 * 60 * 1000);
    
    // Show warning before timeout
    const warningInterval = setInterval(() => {
      const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
      setTimeout(showTimeoutWarning, warningTime);
    }, timeoutMinutes * 60 * 1000);

    return () => {
      clearInterval(timeoutInterval);
      clearInterval(warningInterval);
    };
  }, [enabled, timeoutMinutes, warningMinutes, checkSessionTimeout, showTimeoutWarning]);

  return {
    checkSessionTimeout,
    showTimeoutWarning
  };
};