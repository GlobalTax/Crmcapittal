
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileValidator } from '@/hooks/useFileValidator';
import { getAcceptAttribute, formatAllowedTypes } from '@/utils/fileValidationStrict';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Upload, X, AlertCircle, CheckCircle, FileText, Image } from 'lucide-react';

interface StrictFileUploaderProps {
  onFilesValid: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export const StrictFileUploader = ({ 
  onFilesValid, 
  multiple = false,
  className = "",
  disabled = false
}: StrictFileUploaderProps) => {
  const [validFiles, setValidFiles] = useState<File[]>([]);
  const { validateMultipleFiles, validationErrors, clearErrors, maxSizeMB, allowedTypes } = useFileValidator();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    clearErrors();
    
    if (validateMultipleFiles(acceptedFiles)) {
      setValidFiles(acceptedFiles);
      onFilesValid(acceptedFiles);
    } else {
      setValidFiles([]);
    }
  }, [validateMultipleFiles, onFilesValid, clearErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  const removeFile = (index: number) => {
    const newFiles = validFiles.filter((_, i) => i !== index);
    setValidFiles(newFiles);
    onFilesValid(newFiles);
    clearErrors();
  };

  const clearAll = () => {
    setValidFiles([]);
    onFilesValid([]);
    clearErrors();
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    } else if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
              Máximo {maxSizeMB}MB por archivo
            </p>
            <p className="text-xs text-gray-400">
              Solo se permiten: {allowedTypes}
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
              <AlertDescription>{error}</AlertDescription>
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
            {validFiles.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="text-xs"
              >
                Limpiar todo
              </Button>
            )}
          </div>
          
          {validFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border">
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="ml-2 p-1 h-auto text-gray-500 hover:text-red-600"
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
