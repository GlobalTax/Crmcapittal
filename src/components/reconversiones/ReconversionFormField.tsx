import React, { useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useFormValidation, ValidationRule } from '@/contexts/FormValidationContext';
import { ValidationTooltip } from '@/components/validation/ValidationTooltip';

interface ReconversionFormFieldProps {
  fieldName: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  className?: string;
  validation?: ValidationRule;
  alerts?: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }>;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return null;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'default';
    default:
      return 'default';
  }
};

export const ReconversionFormField: React.FC<ReconversionFormFieldProps> = ({
  fieldName,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className,
  validation,
  alerts = []
}) => {
  const { validateField, setFieldTouched, setFieldError, validationState } = useFormValidation();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const error = validationState.errors[fieldName];
  const isTouched = validationState.touched[fieldName];
  const hasValidationError = error && isTouched;

  const handleBlur = useCallback(() => {
    if (validation) {
      const fieldError = validateField(fieldName, value, validation);
      setFieldError(fieldName, fieldError);
      setFieldTouched(fieldName);
    }
  }, [fieldName, value, validation, validateField, setFieldError, setFieldTouched]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? (e.target.value ? e.target.value : '') : e.target.value;
    onChange(newValue);
    
    // Clear validation error when user starts typing if field was touched
    if (isTouched && error && validation) {
      const fieldError = validateField(fieldName, newValue, validation);
      setFieldError(fieldName, fieldError);
    }
  }, [onChange, type, isTouched, error, validation, fieldName, validateField, setFieldError]);

  const fieldAlert = alerts.find(alert => alert.field === fieldName);
  const hasError = hasValidationError || (fieldAlert?.severity === 'error');
  const hasWarning = fieldAlert?.severity === 'warning';

  const inputClassName = cn(
    "transition-colors",
    hasError && "border-destructive focus:ring-destructive focus:border-destructive",
    hasWarning && "border-orange-400 focus:ring-orange-400",
    className
  );

  const commonProps = {
    value: value || '',
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: () => setShowTooltip(true),
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
    placeholder,
    className: inputClassName
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return <Textarea {...commonProps} rows={3} />;
    }
    return <Input {...commonProps} type={type} />;
  };

  return (
    <div className={`space-y-2 ${className} relative`}>
      <Label htmlFor={fieldName} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {fieldAlert && (
          <span className={cn(
            "ml-1",
            fieldAlert.severity === 'error' && "text-destructive",
            fieldAlert.severity === 'warning' && "text-orange-600",
            fieldAlert.severity === 'info' && "text-blue-600"
          )}>
            {getSeverityIcon(fieldAlert.severity)}
          </span>
        )}
      </Label>
      
      <div className="relative">
        {renderInput()}
        {hasValidationError && (
          <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>

      {hasValidationError && showTooltip && (
        <ValidationTooltip error={error} />
      )}
      
      {fieldAlert && (
        <Alert variant={getSeverityColor(fieldAlert.severity) as any} className="py-2">
          {getSeverityIcon(fieldAlert.severity)}
          <AlertDescription className="text-sm">
            {fieldAlert.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};