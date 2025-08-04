
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/stores/useAuthStore';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

interface ValidationRequest {
  action: 'create' | 'update' | 'delete' | 'assignment_change';
  reconversionId?: string;
  data?: any;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function useReconversionSecurity() {
  const [validating, setValidating] = useState(false);
  const { role } = useUserRole();
  const { user } = useAuth();
  const { sanitizeInput } = useSecureInput();
  const { logUnauthorizedAccess, logSuspiciousActivity } = useSecurityMonitor();

  const validateAction = async (request: ValidationRequest): Promise<ValidationResult> => {
    setValidating(true);
    
    try {
      // Sanitize input data before sending
      const sanitizedRequest = {
        ...request,
        data: request.data ? sanitizeInputData(request.data) : undefined
      };

      const { data, error } = await supabase.functions.invoke('validate-reconversion-security', {
        body: sanitizedRequest
      });

      if (error) {
        console.error('Error validating reconversion action:', error);
        logSuspiciousActivity('validation_error', { error: error.message }).catch(console.error);
        return { valid: false, errors: ['Error de validación del servidor'] };
      }

      return data as ValidationResult;
    } catch (err) {
      console.error('Error calling validation function:', err);
      logSuspiciousActivity('validation_exception', { error: String(err) }).catch(console.error);
      return { valid: false, errors: ['Error de conexión'] };
    } finally {
      setValidating(false);
    }
  };

  const sanitizeInputData = (data: any): any => {
    if (typeof data === 'string') {
      return sanitizeInput(data, { maxLength: 5000 });
    }
    
    if (Array.isArray(data)) {
      return data.map(sanitizeInputData);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = sanitizeInputData(value);
      }
      return sanitized;
    }
    
    return data;
  };

  const hasPermission = (reconversion: any, action: 'read' | 'write' | 'delete' = 'read') => {
    if (!reconversion || !user) {
      if (reconversion) {
        logUnauthorizedAccess('reconversion', action).catch(console.error);
      }
      return false;
    }
    
    const currentUserId = user.id;
    
    // Admins tienen todos los permisos
    if (role === 'admin' || role === 'superadmin') {
      return true;
    }

    // Solo delete requiere admin
    if (action === 'delete') {
      logUnauthorizedAccess(`reconversion:${reconversion.id}`, 'delete_attempt_non_admin').catch(console.error);
      return false;
    }

    // Verificar si el usuario tiene permisos sobre esta reconversión
    const isCreator = reconversion.created_by === currentUserId;
    const isAssigned = reconversion.assigned_to === currentUserId;
    const isPipelineOwner = reconversion.pipeline_owner_id === currentUserId;
    
    // Para lectura: permitir si es creador, asignado, pipeline owner o admin
    if (action === 'read') {
      const hasAccess = isCreator || isAssigned || isPipelineOwner;
      if (!hasAccess) {
        logUnauthorizedAccess(`reconversion:${reconversion.id}`, 'read_attempt').catch(console.error);
      }
      return hasAccess;
    }
    
    // Para escritura: permitir si es creador, asignado o admin
    if (action === 'write') {
      const hasAccess = isCreator || isAssigned;
      if (!hasAccess) {
        logUnauthorizedAccess(`reconversion:${reconversion.id}`, 'write_attempt').catch(console.error);
      }
      return hasAccess;
    }
    
    return false;
  };

  const canViewSensitiveData = (reconversion: any) => {
    return hasPermission(reconversion, 'read');
  };

  const maskSensitiveData = (data: string, showLast: number = 4) => {
    if (!data || data.length <= showLast) return data;
    return '*'.repeat(data.length - showLast) + data.slice(-showLast);
  };

  return {
    validateAction,
    hasPermission,
    canViewSensitiveData,
    maskSensitiveData,
    validating,
    isAdmin: role === 'admin' || role === 'superadmin'
  };
}
