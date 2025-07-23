import React from 'react';
import { useReconversionAlerts } from '@/hooks/useReconversionAlerts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReconversionFormFieldProps {
  fieldName: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  className?: string;
  alerts?: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }>;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
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
  alerts = []
}) => {
  const fieldAlert = alerts.find(alert => alert.field === fieldName);
  const hasError = fieldAlert?.severity === 'error';
  const hasWarning = fieldAlert?.severity === 'warning';

  const inputClassName = cn(
    hasError && "border-destructive focus:ring-destructive",
    hasWarning && "border-orange-400 focus:ring-orange-400",
    className
  );

  const renderInput = () => {
    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(e.target.value),
      placeholder,
      className: inputClassName
    };

    if (type === 'textarea') {
      return <Textarea {...commonProps} rows={3} />;
    }

    return <Input {...commonProps} type={type} />;
  };

  return (
    <div className="space-y-2">
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
      
      {renderInput()}
      
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