import React from 'react';
import { FieldError } from '@/contexts/FormValidationContext';
import { cn } from '@/lib/utils';

interface ValidationTooltipProps {
  error: FieldError;
  className?: string;
}

export const ValidationTooltip: React.FC<ValidationTooltipProps> = ({ 
  error, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "absolute z-50 top-full left-0 mt-1 px-2 py-1 text-xs text-white bg-destructive rounded shadow-lg",
        "before:content-[''] before:absolute before:bottom-full before:left-2 before:border-4",
        "before:border-transparent before:border-b-destructive",
        "animate-in fade-in-0 slide-in-from-top-1 duration-150",
        className
      )}
      role="tooltip"
    >
      {error.message}
    </div>
  );
};