
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/useToast';

export const useValoracionSecurity = () => {
  const logSecurityEvent = useCallback(async (
    valoracionId: string,
    action: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    try {
      const user = await supabase.auth.getUser();
      
      await supabase.from('valoracion_security_logs').insert({
        valoracion_id: valoracionId,
        action,
        details,
        severity,
        user_id: user.data.user?.id,
        ip_address: null, // IP will be captured server-side
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, []);

  const logPhaseChange = useCallback(async (
    valoracionId: string,
    fromPhase: string,
    toPhase: string,
    userId?: string
  ) => {
    await logSecurityEvent(
      valoracionId,
      'phase_change',
      {
        from_phase: fromPhase,
        to_phase: toPhase,
        changed_by: userId
      },
      'high'
    );
  }, [logSecurityEvent]);

  const logUnauthorizedAccess = useCallback(async (
    valoracionId: string,
    attemptedAction: string,
    reason: string
  ) => {
    await logSecurityEvent(
      valoracionId,
      'unauthorized_access_attempt',
      {
        attempted_action: attemptedAction,
        denial_reason: reason
      },
      'high'
    );

    // También mostrar notificación al usuario
    toast({
      title: 'Acceso denegado',
      description: reason,
      variant: 'destructive'
    });
  }, [logSecurityEvent]);

  const logDocumentAccess = useCallback(async (
    valoracionId: string,
    documentId: string,
    action: 'upload' | 'download' | 'view' | 'delete',
    documentName: string
  ) => {
    await logSecurityEvent(
      valoracionId,
      `document_${action}`,
      {
        document_id: documentId,
        document_name: documentName,
        action
      },
      action === 'delete' ? 'high' : 'medium'
    );
  }, [logSecurityEvent]);

  const generateClientAccessToken = useCallback(async (valoracionId: string) => {
    try {
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('valoraciones')
        .update({ 
          notes: `Token de acceso generado: ${token}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', valoracionId);

      if (error) throw error;

      await logSecurityEvent(
        valoracionId,
        'client_access_token_generated',
        { token: token.substring(0, 8) + '...' }, // Solo loggear parte del token
        'high'
      );

      return token;
    } catch (error) {
      console.error('Error generating client access token:', error);
      throw error;
    }
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logPhaseChange,
    logUnauthorizedAccess,
    logDocumentAccess,
    generateClientAccessToken
  };
};
