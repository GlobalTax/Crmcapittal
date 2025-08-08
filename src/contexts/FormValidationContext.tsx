import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  format?: 'email' | 'phone' | 'nif' | 'url';
  atLeastOne?: string[];
  min?: number;
  max?: number;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface FieldError {
  message: string;
  type: 'required' | 'format' | 'length' | 'atLeastOne' | 'range';
}

export interface ValidationState {
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
  isValid: boolean;
}

interface FormValidationContextType {
  validationState: ValidationState;
  validateField: (fieldName: string, value: any, rules: ValidationRule) => FieldError | null;
  validateForm: (data: any, rules: ValidationRules) => ValidationState;
  setFieldTouched: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: FieldError | null) => void;
  resetValidation: () => void;
  canSave: boolean;
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined);

interface FormValidationProviderProps {
  children: ReactNode;
  initialRules?: ValidationRules;
}

export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({ 
  children, 
  initialRules = {} 
}) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    touched: {},
    isValid: true
  });

  const validateField = useCallback((fieldName: string, value: any, rule: ValidationRule): FieldError | null => {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return { message: 'Este campo es requerido', type: 'required' };
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return { message: `Mínimo ${rule.minLength} caracteres`, type: 'length' };
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return { message: `Máximo ${rule.maxLength} caracteres`, type: 'length' };
      }
    }

    // Format validation
    if (rule.format && typeof value === 'string') {
      switch (rule.format) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { message: 'Formato de email inválido', type: 'format' };
          }
          break;
        case 'phone':
          const phoneRegex = /^[+]?[0-9\s-()]{9,}$/;
          if (!phoneRegex.test(value)) {
            return { message: 'Formato de teléfono inválido', type: 'format' };
          }
          break;
        case 'nif':
          const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
          if (!nifRegex.test(value)) {
            return { message: 'Formato de NIF inválido', type: 'format' };
          }
          break;
      }
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return { message: `Valor mínimo: ${rule.min}`, type: 'range' };
      }
      if (rule.max !== undefined && value > rule.max) {
        return { message: `Valor máximo: ${rule.max}`, type: 'range' };
      }
    }

    return null;
  }, []);

  const validateForm = useCallback((data: any, rules: ValidationRules): ValidationState => {
    const errors: Record<string, FieldError> = {};
    const touched: Record<string, boolean> = {};

    // Validate individual fields
    Object.keys(rules).forEach(fieldName => {
      const rule = rules[fieldName];
      const value = data[fieldName];
      
      const error = validateField(fieldName, value, rule);
      if (error) {
        errors[fieldName] = error;
      }
      touched[fieldName] = true;
    });

    // Validate "at least one" rules
    Object.keys(rules).forEach(fieldName => {
      const rule = rules[fieldName];
      if (rule.atLeastOne) {
        const hasAtLeastOne = rule.atLeastOne.some(field => {
          const value = data[field];
          return value && (typeof value !== 'string' || value.trim() !== '');
        });
        
        if (!hasAtLeastOne) {
          rule.atLeastOne.forEach(field => {
            if (!errors[field]) {
              errors[field] = { 
                message: `Al menos uno de estos campos es requerido: ${rule.atLeastOne?.join(', ')}`, 
                type: 'atLeastOne' 
              };
              touched[field] = true;
            }
          });
        }
      }
    });

    const newState = {
      errors,
      touched,
      isValid: Object.keys(errors).length === 0
    };

    setValidationState(newState);
    return newState;
  }, [validateField]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true }
    }));
  }, []);

  const setFieldError = useCallback((fieldName: string, error: FieldError | null) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const resetValidation = useCallback(() => {
    setValidationState({
      errors: {},
      touched: {},
      isValid: true
    });
  }, []);

  const canSave = validationState.isValid;

  return (
    <FormValidationContext.Provider 
      value={{
        validationState,
        validateField,
        validateForm,
        setFieldTouched,
        setFieldError,
        resetValidation,
        canSave
      }}
    >
      {children}
    </FormValidationContext.Provider>
  );
};

export const useFormValidation = () => {
  const context = useContext(FormValidationContext);
  if (context === undefined) {
    throw new Error('useFormValidation must be used within a FormValidationProvider');
  }
  return context;
};