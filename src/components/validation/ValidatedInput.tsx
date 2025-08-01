import React, { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useFormValidation, ValidationRule, FieldError } from '@/contexts/FormValidationContext';
import { ValidationTooltip } from './ValidationTooltip';

interface ValidatedInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationRule;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  name,
  value,
  onChange,
  validation,
  placeholder,
  className,
  type = 'text',
  multiline = false,
  rows = 3,
  disabled = false,
  autoFocus = false
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear error when user starts typing if field was touched
    if (isTouched && error) {
      if (validation) {
        const fieldError = validateField(name, newValue, validation);
        setFieldError(name, fieldError);
      }
    }
  }, [onChange, isTouched, error, validation, name, validateField, setFieldError]);

  const inputClassName = cn(
    "transition-colors",
    hasError && "border-destructive focus:border-destructive",
    className
  );

  const InputComponent = multiline ? Textarea : Input;
  const inputProps = {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: () => setShowTooltip(true),
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
    placeholder,
    className: inputClassName,
    disabled,
    autoFocus,
    ...(multiline ? { rows } : { type })
  };

  return (
    <div className="relative">
      <div className="relative">
        <InputComponent {...inputProps} />
        {hasError && (
          <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>
      
      {hasError && showTooltip && (
        <ValidationTooltip error={error} />
      )}
    </div>
  );
};