import React, { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFormValidation, ValidationRule } from '@/contexts/FormValidationContext';
import { ValidationTooltip } from './ValidationTooltip';

interface SelectOption {
  value: string;
  label: string;
}

interface ValidatedSelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  validation?: ValidationRule;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  name,
  value,
  onChange,
  options,
  validation,
  placeholder = "Seleccionar...",
  className,
  disabled = false
}) => {
  const { validateField, setFieldTouched, setFieldError, validationState } = useFormValidation();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const error = validationState.errors[name];
  const isTouched = validationState.touched[name];
  const hasError = error && isTouched;

  const handleBlur = useCallback(() => {
    if (validation) {
      const fieldError = validateField(name, value, validation);
      setFieldError(name, fieldError);
      setFieldTouched(name);
    }
  }, [name, value, validation, validateField, setFieldError, setFieldTouched]);

  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    // Clear error when user selects if field was touched
    if (isTouched && error) {
      if (validation) {
        const fieldError = validateField(name, newValue, validation);
        setFieldError(name, fieldError);
      }
    }
  }, [onChange, isTouched, error, validation, name, validateField, setFieldError]);

  return (
    <div className="relative">
      <div className="relative">
        <Select 
          value={value} 
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              "transition-colors",
              hasError && "border-destructive focus:border-destructive",
              className
            )}
            onBlur={handleBlur}
            onFocus={() => setShowTooltip(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasError && (
          <AlertTriangle className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
        )}
      </div>
      
      {hasError && showTooltip && (
        <ValidationTooltip error={error} />
      )}
    </div>
  );
};