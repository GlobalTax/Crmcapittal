
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateFiles, ValidationError, FILE_VALIDATION_CONFIGS } from '@/utils/fileValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ValidatedFileUploaderProps {
  onFilesValid: (files: File[]) => void;
  validationType: keyof typeof FILE_VALIDATION_CONFIGS;
  multiple?: boolean;
  className?: string;
}

export const ValidatedFileUploader = ({ 
  onFilesValid, 
  validationType, 
  multiple = false,
  className = ""
}: ValidatedFileUploaderProps) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validFiles, setValidFiles] = useState<File[]>([]);

  const config = FILE_VALIDATION_CONFIGS[validationType];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validation = validateFiles(acceptedFiles, {
      ...config,
      maxFiles: multiple ? config.maxFiles : 1
    });

    if (validation.isValid) {
      setValidFiles(acceptedFiles);
      setValidationErrors([]);
      onFilesValid(acceptedFiles);
    } else {
      setValidationErrors(validation.errors);
      setValidFiles([]);
    }
  }, [config, multiple, onFilesValid]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: config.allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  const removeFile = (index: number) => {
    const newFiles = validFiles.filter((_, i) => i !== index);
    setValidFiles(newFiles);
    onFilesValid(newFiles);
  };

  const clearAll = () => {
    setValidFiles([]);
    setValidationErrors([]);
    onFilesValid([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600">Suelta los archivos aquí...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              Máximo {config.maxSize / 1024 / 1024}MB por archivo
            </p>
            <p className="text-xs text-gray-400">
              Formatos: {config.allowedTypes.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{error.file}:</strong> {error.error}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Archivos válidos */}
      {validFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Archivos válidos ({validFiles.length})
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAll}
              className="text-xs"
            >
              Limpiar todo
            </Button>
          </div>
          
          {validFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border">
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="ml-2 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
