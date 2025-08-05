import React from 'react';
import { useFieldVisibility } from '@/hooks/useFieldVisibility';
import { cn } from '@/lib/utils';

interface SecureFieldProps {
  tableName: string;
  fieldName: string;
  value: any;
  renderAs?: 'text' | 'badge' | 'currency' | 'percentage';
  className?: string;
  fallback?: React.ReactNode;
  children?: (props: {
    isVisible: boolean;
    isEditable: boolean;
    maskedValue: string;
    originalValue: any;
  }) => React.ReactNode;
}

export const SecureField: React.FC<SecureFieldProps> = ({
  tableName,
  fieldName,
  value,
  renderAs = 'text',
  className,
  fallback = null,
  children
}) => {
  const { isVisible, isEditable, getMaskedValue, loading } = useFieldVisibility({
    tableName,
    fieldName
  });

  if (loading) {
    return <div className="animate-pulse bg-muted rounded w-16 h-4" />;
  }

  if (!isVisible) {
    return fallback || <span className="text-muted-foreground">-</span>;
  }

  const maskedValue = getMaskedValue(value);

  // If children function is provided, use it
  if (children) {
    return (
      <>
        {children({
          isVisible,
          isEditable,
          maskedValue,
          originalValue: value
        })}
      </>
    );
  }

  const renderValue = () => {
    switch (renderAs) {
      case 'currency':
        return maskedValue === '***' ? '***' : `€${maskedValue}`;
      case 'percentage':
        return maskedValue === '***' ? '***' : `${maskedValue}%`;
      case 'badge':
        return (
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
            "bg-background text-foreground ring-border",
            className
          )}>
            {maskedValue}
          </span>
        );
      default:
        return maskedValue;
    }
  };

  return (
    <span className={cn(
      maskedValue === '***' && "text-muted-foreground font-mono",
      className
    )}>
      {renderValue()}
    </span>
  );
};