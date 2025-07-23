import { ValoracionStatus } from '@/types/Valoracion';

export interface ValoracionFileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValoracionFileConfig {
  allowedTypes: string[];
  maxSize: number; // in bytes
  description: string;
}

export const VALORACION_FILE_CONFIGS: Record<ValoracionStatus, ValoracionFileConfig> = {
  requested: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'Documentos de solicitud (PDF, Word)'
  },
  in_process: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
    description: 'Documentos de trabajo (PDF, Word, Excel, imágenes)'
  },
  completed: {
    allowedTypes: ['application/pdf'],
    maxSize: 15 * 1024 * 1024, // 15MB
    description: 'Solo documentos finales en PDF'
  },
  delivered: {
    allowedTypes: [],
    maxSize: 0,
    description: 'No se pueden subir documentos después de la entrega'
  }
};

export const validateValoracionFile = (
  file: File, 
  valoracionStatus: ValoracionStatus
): ValoracionFileValidationResult => {
  const config = VALORACION_FILE_CONFIGS[valoracionStatus];
  const errors: string[] = [];

  // Check if uploads are allowed for this status
  if (config.allowedTypes.length === 0) {
    errors.push('No se pueden subir documentos en esta fase');
    return { isValid: false, errors };
  }

  // Validate file type
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. ${config.description}`);
  }

  // Validate file size
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / 1024 / 1024;
    errors.push(`Archivo demasiado grande. Máximo ${maxSizeMB}MB`);
  }

  // Validate file is not empty
  if (file.size === 0) {
    errors.push('El archivo está vacío');
  }

  // Validate file name
  if (file.name.length > 255) {
    errors.push('Nombre de archivo demasiado largo (máximo 255 caracteres)');
  }

  // Check for potentially dangerous files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push('Tipo de archivo no permitido por seguridad');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateValoracionFiles = (
  files: File[], 
  valoracionStatus: ValoracionStatus
): ValoracionFileValidationResult => {
  const allErrors: string[] = [];

  // Validate total number of files
  if (files.length > 10) {
    allErrors.push('Máximo 10 archivos por subida');
  }

  // Validate each file
  files.forEach((file, index) => {
    const validation = validateValoracionFile(file, valoracionStatus);
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        allErrors.push(`${file.name}: ${error}`);
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

export const getAcceptedFileTypes = (valoracionStatus: ValoracionStatus): string => {
  const config = VALORACION_FILE_CONFIGS[valoracionStatus];
  return config.allowedTypes.join(',');
};

export const getFileTypeDescription = (valoracionStatus: ValoracionStatus): string => {
  const config = VALORACION_FILE_CONFIGS[valoracionStatus];
  return config.description;
};