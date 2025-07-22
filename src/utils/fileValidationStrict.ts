
export interface StrictValidationError {
  file: string;
  error: string;
  code: 'INVALID_TYPE' | 'TOO_LARGE' | 'GENERAL_ERROR';
}

export interface StrictValidationResult {
  isValid: boolean;
  errors: StrictValidationError[];
}

// Configuración estricta para leads/propuestas
export const STRICT_FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg']
};

export const validateFileStrict = (file: File): StrictValidationResult => {
  const errors: StrictValidationError[] = [];

  // Validar tipo de archivo
  if (!STRICT_FILE_CONFIG.allowedTypes.includes(file.type)) {
    errors.push({
      file: file.name,
      error: 'Tipo de archivo no permitido. Solo se permiten PDF, PNG y JPEG',
      code: 'INVALID_TYPE'
    });
  }

  // Validar tamaño
  if (file.size > STRICT_FILE_CONFIG.maxSize) {
    errors.push({
      file: file.name,
      error: `Archivo demasiado grande. Máximo ${STRICT_FILE_CONFIG.maxSize / 1024 / 1024}MB`,
      code: 'TOO_LARGE'
    });
  }

  // Validar que el archivo no esté vacío
  if (file.size === 0) {
    errors.push({
      file: file.name,
      error: 'El archivo está vacío',
      code: 'GENERAL_ERROR'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFilesStrict = (files: File[]): StrictValidationResult => {
  const allErrors: StrictValidationError[] = [];

  files.forEach(file => {
    const validation = validateFileStrict(file);
    allErrors.push(...validation.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

export const getAcceptAttribute = (): string => {
  return STRICT_FILE_CONFIG.allowedTypes.join(',');
};

export const formatAllowedTypes = (): string => {
  return 'PDF, PNG, JPEG';
};
