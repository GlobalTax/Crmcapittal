import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  variant?: 'dialog' | 'form';
  className?: string;
}

export const FormActions = ({
  onCancel,
  onSubmit,
  submitText = "Guardar",
  cancelText = "Cancelar",
  isLoading = false,
  submitDisabled = false,
  variant = 'dialog',
  className = ""
}: FormActionsProps) => {
  const containerClasses = variant === 'dialog' 
    ? "flex justify-end space-x-3 pt-4 border-t border-gray-100"
    : "flex justify-end space-x-3";

  return (
    <div className={`${containerClasses} ${className}`}>
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
      )}
      
      {onSubmit && (
        <Button 
          type="submit" 
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading || submitDisabled}
        >
          {isLoading ? "Guardando..." : submitText}
        </Button>
      )}
    </div>
  );
};