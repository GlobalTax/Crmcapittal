export interface ValidationError {
  file: string;
  error: string;
}

export interface FileValidationConfig {
  maxSize: number;
  maxFiles: number;
  allowedTypes: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const FILE_VALIDATION_CONFIGS: Record<string, FileValidationConfig> = {
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
  },
  spreadsheets: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    allowedTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"]
  },
  // Nueva configuración estricta para leads/propuestas
  leadDocuments: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/png", "image/jpeg"]
  }
};

import { validateFile } from './validation';

export const validateFiles = (files: File[], config: FileValidationConfig): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar número de archivos
  if (files.length > config.maxFiles) {
    errors.push({
      file: 'general',
      error: `Máximo ${config.maxFiles} archivo(s) permitido(s)`
    });
  }

  // Validar cada archivo
  files.forEach(file => {
    const fileValidation = validateFile(file);
    
    if (!fileValidation.valid) {
      errors.push({
        file: file.name,
        error: fileValidation.error || 'Error de validación'
      });
      return;
    }

    // Validar tamaño específico del config
    if (file.size > config.maxSize) {
      errors.push({
        file: file.name,
        error: `Archivo demasiado grande. Máximo ${config.maxSize / 1024 / 1024}MB`
      });
    }

    // Validar tipo específico del config
    if (!config.allowedTypes.includes(file.type)) {
      errors.push({
        file: file.name,
        error: `Tipo de archivo no válido. Tipos permitidos: ${config.allowedTypes.join(', ')}`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
