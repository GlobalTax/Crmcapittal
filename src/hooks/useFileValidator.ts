
import { useState } from 'react';
import { validateFileStrict, validateFilesStrict, StrictValidationResult, STRICT_FILE_CONFIG } from '@/utils/fileValidationStrict';
import { toast } from 'sonner';

export const useFileValidator = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateSingleFile = (file: File): boolean => {
    setIsValidating(true);
    setValidationErrors([]);

    const result = validateFileStrict(file);
    
    if (!result.isValid) {
      const errors = result.errors.map(err => err.error);
      setValidationErrors(errors);
      
      // Mostrar toast con el primer error
      toast.error(errors[0]);
      setIsValidating(false);
      return false;
    }

    setIsValidating(false);
    return true;
  };

  const validateMultipleFiles = (files: File[]): boolean => {
    setIsValidating(true);
    setValidationErrors([]);

    const result = validateFilesStrict(files);
    
    if (!result.isValid) {
      const errors = result.errors.map(err => err.error);
      setValidationErrors(errors);
      
      // Mostrar toast con resumen de errores
      toast.error(`${errors.length} error(es) de validación encontrados`);
      setIsValidating(false);
      return false;
    }

    setIsValidating(false);
    return true;
  };

  const clearErrors = () => {
    setValidationErrors([]);
  };

  return {
    validateSingleFile,
    validateMultipleFiles,
    validationErrors,
    isValidating,
    clearErrors,
    maxSizeMB: STRICT_FILE_CONFIG.maxSize / 1024 / 1024,
    allowedTypes: 'PDF, PNG, JPEG'
  };
};
