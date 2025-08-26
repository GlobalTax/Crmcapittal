/**
 * Reconversion Security Hook
 * 
 * Custom hook for managing reconversion security and permissions
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { createLogger } from '@/utils/productionLogger';
import type { Reconversion } from '@/types/Reconversion';

interface ValidationRequest {
  action: 'read' | 'write' | 'delete' | 'assign';
  reconversionId?: string;
  data?: any;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const logger = createLogger('useReconversionSecurity');

export function useReconversionSecurity() {
  const [validating, setValidating] = useState(false);
  const { role } = useUserRole();
  const { user } = useAuth();
  const { sanitizeInput } = useSecureInput();
  const { logUnauthorizedAccess, logSuspiciousActivity } = useSecurityMonitor();

  const validateAction = async (request: ValidationRequest): Promise<ValidationResult> => {
    setValidating(true);
    
    try {
      const errors: string[] = [];

      // Basic authentication check
      if (!user) {
        errors.push('Usuario no autenticado');
        await logUnauthorizedAccess('reconversion', 'authentication_failed');
        return { valid: false, errors };
      }

      // Role-based permissions
      const isAdmin = role === 'admin' || role === 'superadmin';
      const isUser = role === 'user';

      switch (request.action) {
        case 'read':
          // All authenticated users can read
          break;
          
        case 'write':
          // Users can write their own, admins can write all
          if (!isAdmin && !isUser) {
            errors.push('Sin permisos para modificar reconversiones');
          }
          break;
          
        case 'delete':
          // Only admins can delete
          if (!isAdmin) {
            errors.push('Solo los administradores pueden eliminar reconversiones');
          }
          break;
          
        case 'assign':
          // Only admins can assign
          if (!isAdmin) {
            errors.push('Solo los administradores pueden asignar reconversiones');
          }
          break;
          
        default:
          errors.push('Acción no válida');
      }

      // Data validation if provided
      if (request.data) {
        const sanitizedData = sanitizeInput(request.data);
        if (JSON.stringify(sanitizedData) !== JSON.stringify(request.data)) {
          await logSuspiciousActivity('data_sanitization', {
            description: 'Datos potencialmente maliciosos detectados',
            metadata: { original: request.data, sanitized: sanitizedData }
          });
        }
      }

      const isValid = errors.length === 0;
      
      if (!isValid) {
        logger.warn('Security validation failed', { 
          userId: user.id, 
          action: request.action, 
          errors 
        });
      }

      return { valid: isValid, errors };
    } catch (error) {
      logger.error('Error in security validation', error);
      return { valid: false, errors: ['Error de validación de seguridad'] };
    } finally {
      setValidating(false);
    }
  };

  const hasPermission = (reconversion: Reconversion, action: 'read' | 'write' | 'delete' | 'assign'): boolean => {
    if (!user) return false;

    const isAdmin = role === 'admin' || role === 'superadmin';
    const isOwner = reconversion.created_by === user.id || reconversion.assigned_to === user.id;

    switch (action) {
      case 'read':
        return true; // All authenticated users can read
      case 'write':
        return isAdmin || isOwner;  
      case 'delete':
        return isAdmin;
      case 'assign':
        return isAdmin;
      default:
        return false;
    }
  };

  const canViewSensitiveData = (reconversion: Reconversion): boolean => {
    if (!user) return false;
    
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isOwner = reconversion.created_by === user.id || reconversion.assigned_to === user.id;
    
    return isAdmin || isOwner;
  };

  const maskSensitiveData = (data: string): string => {
    if (!data) return '';
    
    // Mask email addresses
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    }
    
    // Mask phone numbers
    if (/^\+?[\d\s-()]+$/.test(data)) {
      return data.replace(/\d/g, '*').slice(0, -4) + data.slice(-4);
    }
    
    // Mask other sensitive text
    if (data.length > 6) {
      return data.substring(0, 3) + '***' + data.substring(data.length - 3);
    }
    
    return '***';
  };

  const isAdmin = role === 'admin' || role === 'superadmin';

  return {
    // Validation
    validateAction,
    validating,
    
    // Permissions
    hasPermission,
    canViewSensitiveData,
    
    // Data security
    maskSensitiveData,
    
    // Role info
    isAdmin,
    role,
    userId: user?.id
  };
}