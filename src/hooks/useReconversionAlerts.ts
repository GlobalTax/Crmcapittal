import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Reconversion } from '@/types/Reconversion';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface AlertOptions {
  showToast?: boolean;
  autoHide?: boolean;
  duration?: number;
}

export function useReconversionAlerts() {
  const [alerts, setAlerts] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateReconversionData = useCallback((data: Partial<Reconversion>): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Campos obligatorios
    if (!data.company_name?.trim()) {
      errors.push({
        field: 'company_name',
        message: 'El nombre de la empresa es obligatorio',
        severity: 'error'
      });
    }

    if (!data.contact_name?.trim()) {
      errors.push({
        field: 'contact_name',
        message: 'El nombre del contacto es obligatorio',
        severity: 'error'
      });
    }

    if (!data.rejection_reason?.trim()) {
      errors.push({
        field: 'rejection_reason',
        message: 'La razón de rechazo es obligatoria',
        severity: 'error'
      });
    }

    // Validaciones de email
    if (data.contact_email && !isValidEmail(data.contact_email)) {
      errors.push({
        field: 'contact_email',
        message: 'El formato del email no es válido',
        severity: 'error'
      });
    }

    // Validaciones de teléfono
    if (data.contact_phone && !isValidPhone(data.contact_phone)) {
      errors.push({
        field: 'contact_phone',
        message: 'El formato del teléfono no es válido',
        severity: 'warning'
      });
    }

    // Validaciones de capacidad de inversión
    if (data.investment_capacity_min && data.investment_capacity_max) {
      if (data.investment_capacity_min > data.investment_capacity_max) {
        errors.push({
          field: 'investment_capacity',
          message: 'La capacidad mínima no puede ser mayor que la máxima',
          severity: 'error'
        });
      }
    }

    // Alertas informativas
    if (!data.contact_email && !data.contact_phone) {
      errors.push({
        field: 'contact_info',
        message: 'Se recomienda incluir al menos un email o teléfono de contacto',
        severity: 'warning'
      });
    }

    if (!data.target_sectors || data.target_sectors.length === 0) {
      errors.push({
        field: 'target_sectors',
        message: 'Considera añadir sectores objetivo para mejorar el matching',
        severity: 'info'
      });
    }

    if (!data.target_locations || data.target_locations.length === 0) {
      errors.push({
        field: 'target_locations',
        message: 'Las preferencias geográficas ayudan a encontrar mejores opciones',
        severity: 'info'
      });
    }

    return errors;
  }, []);

  const validateAndShowAlerts = useCallback((
    data: Partial<Reconversion>, 
    options: AlertOptions = {}
  ) => {
    setIsValidating(true);
    
    const errors = validateReconversionData(data);
    setAlerts(errors);

    if (options.showToast) {
      const errorCount = errors.filter(e => e.severity === 'error').length;
      const warningCount = errors.filter(e => e.severity === 'warning').length;
      
      if (errorCount > 0) {
        toast.error(`${errorCount} error(es) encontrado(s)`, {
          description: 'Revisa los campos marcados en rojo'
        });
      } else if (warningCount > 0) {
        toast.warning(`${warningCount} advertencia(s)`, {
          description: 'Algunos campos podrían mejorarse'
        });
      } else if (errors.length === 0) {
        toast.success('Datos validados correctamente', {
          description: 'Todos los campos están completos'
        });
      }
    }

    setIsValidating(false);
    return errors;
  }, [validateReconversionData]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getFieldAlert = useCallback((fieldName: string) => {
    return alerts.find(alert => alert.field === fieldName);
  }, [alerts]);

  const hasErrors = useCallback(() => {
    return alerts.some(alert => alert.severity === 'error');
  }, [alerts]);

  const hasWarnings = useCallback(() => {
    return alerts.some(alert => alert.severity === 'warning');
  }, [alerts]);

  const showSuccessAlert = useCallback((message: string, description?: string) => {
    toast.success(message, { description });
  }, []);

  const showErrorAlert = useCallback((message: string, description?: string) => {
    toast.error(message, { description });
  }, []);

  const showWarningAlert = useCallback((message: string, description?: string) => {
    toast.warning(message, { description });
  }, []);

  const showInfoAlert = useCallback((message: string, description?: string) => {
    toast.info(message, { description });
  }, []);

  return {
    alerts,
    isValidating,
    validateAndShowAlerts,
    clearAlerts,
    getFieldAlert,
    hasErrors,
    hasWarnings,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert
  };
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Spanish phone number regex (simplified)
  const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}