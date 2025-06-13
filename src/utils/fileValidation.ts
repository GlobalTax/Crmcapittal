
export interface FileValidationConfig {
  maxSize: number; // en bytes
  allowedTypes: string[];
  maxFiles?: number;
}

export interface ValidationError {
  file: string;
  error: string;
}

export const validateFiles = (
  files: FileList | File[], 
  config: FileValidationConfig
): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const fileArray = Array.from(files);

  // Validar número máximo de archivos
  if (config.maxFiles && fileArray.length > config.maxFiles) {
    errors.push({
      file: 'general',
      error: `Máximo ${config.maxFiles} archivo(s) permitido(s)`
    });
  }

  fileArray.forEach((file) => {
    // Validar tamaño
    if (file.size > config.maxSize) {
      errors.push({
        file: file.name,
        error: `Archivo demasiado grande. Máximo: ${formatFileSize(config.maxSize)}`
      });
    }

    // Validar tipo
    if (!config.allowedTypes.includes(file.type)) {
      errors.push({
        file: file.name,
        error: `Tipo de archivo no permitido. Permitidos: ${config.allowedTypes.join(', ')}`
      });
    }

    // Validaciones adicionales para imágenes
    if (file.type.startsWith('image/')) {
      validateImageFile(file, errors);
    }

    // Validaciones adicionales para Excel/CSV
    if (isSpreadsheetFile(file)) {
      validateSpreadsheetFile(file, errors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateImageFile = (file: File, errors: ValidationError[]) => {
  // Validar que la imagen no esté corrupta (validación básica por extensión)
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validImageExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    errors.push({
      file: file.name,
      error: 'Extensión de imagen no válida'
    });
  }
};

const validateSpreadsheetFile = (file: File, errors: ValidationError[]) => {
  const validSpreadsheetExtensions = ['.xlsx', '.xls', '.csv'];
  const hasValidExtension = validSpreadsheetExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    errors.push({
      file: file.name,
      error: 'Formato de archivo no válido para datos'
    });
  }
};

const isSpreadsheetFile = (file: File): boolean => {
  return file.type.includes('spreadsheet') || 
         file.type.includes('csv') ||
         file.name.toLowerCase().endsWith('.xlsx') ||
         file.name.toLowerCase().endsWith('.xls') ||
         file.name.toLowerCase().endsWith('.csv');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Configuraciones predefinidas
export const FILE_VALIDATION_CONFIGS = {
  IMAGES: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 1
  },
  SPREADSHEETS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ],
    maxFiles: 1
  },
  DOCUMENTS: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFiles: 5
  }
} as const;
