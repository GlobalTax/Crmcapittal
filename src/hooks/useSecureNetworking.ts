import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for secure networking operations without external dependencies
 */
export const useSecureNetworking = () => {
  const getClientInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || null,
      language: navigator.language,
      platform: navigator.platform
    };
  }, []);

  const logWithClientInfo = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const clientInfo = getClientInfo();
      
      // Use enhanced security logging function
      const { data, error } = await supabase.rpc('enhanced_log_security_event', {
        p_event_type: eventType,
        p_severity: severity,
        p_description: description,
        p_metadata: {
          ...metadata,
          ...clientInfo
        }
      });

      if (error) {
        console.error('Error logging security event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in secure logging:', error);
      return null;
    }
  }, [getClientInfo]);

  return {
    getClientInfo,
    logWithClientInfo
  };
};