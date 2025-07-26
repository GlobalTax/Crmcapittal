
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

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

  const validateAction = async (request: ValidationRequest): Promise<ValidationResult> => {
    setValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-reconversion-security', {
        body: request
      });

      if (error) {
        console.error('Error validating reconversion action:', error);
        return { valid: false, errors: ['Error de validación del servidor'] };
      }

      return data as ValidationResult;
    } catch (err) {
      console.error('Error calling validation function:', err);
      return { valid: false, errors: ['Error de conexión'] };
    } finally {
      setValidating(false);
    }
  };

  const hasPermission = (reconversion: any, action: 'read' | 'write' | 'delete' = 'read') => {
    if (!reconversion || !user) return false;
    
    const currentUserId = user.id;
    
    // Admins tienen todos los permisos
    if (role === 'admin' || role === 'superadmin') {
      return true;
    }

    // Solo delete requiere admin
    if (action === 'delete') {
      return false;
    }

    // Verificar si el usuario tiene permisos sobre esta reconversión
    const isCreator = reconversion.created_by === currentUserId;
    const isAssigned = reconversion.assigned_to === currentUserId;
    const isPipelineOwner = reconversion.pipeline_owner_id === currentUserId;
    
    // Para lectura: permitir si es creador, asignado, pipeline owner o admin
    if (action === 'read') {
      return isCreator || isAssigned || isPipelineOwner;
    }
    
    // Para escritura: permitir si es creador, asignado o admin
    if (action === 'write') {
      return isCreator || isAssigned;
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
