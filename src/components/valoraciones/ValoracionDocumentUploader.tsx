
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { SecureButton } from './SecureButton';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';
import { Valoracion } from '@/types/Valoracion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/useToast';
import { 
  validateValoracionFiles, 
  getAcceptedFileTypes, 
  getFileTypeDescription 
} from '@/utils/valoracionFileValidation';
import { getDocumentIcon } from '@/utils/documentIcons';

interface ValoracionDocumentUploaderProps {
  valoracion: Valoracion;
  onUploadComplete?: () => void;
}

export const ValoracionDocumentUploader = ({ 
  valoracion, 
  onUploadComplete 
}: ValoracionDocumentUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const permissions = useValoracionPermissions(valoracion);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: getAcceptedFileTypes(valoracion.status) 
      ? getAcceptedFileTypes(valoracion.status)
          .split(',')
          .reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {})
      : {},
    multiple: true,
    disabled: !permissions.canUploadDocuments || uploading,
    onDrop: (acceptedFiles: File[], rejectedFiles) => {
      // Clear previous errors
      setValidationErrors([]);
      
      if (rejectedFiles.length > 0) {
        const rejectionErrors = rejectedFiles.map(rejection => 
          `${rejection.file.name}: ${rejection.errors[0]?.message || 'Archivo rechazado'}`
        );
        setValidationErrors(rejectionErrors);
      }

      // Validate accepted files
      const validation = validateValoracionFiles(acceptedFiles, valoracion.status);
      if (!validation.isValid) {
        setValidationErrors(prev => [...prev, ...validation.errors]);
        setSelectedFiles([]);
        return;
      }

      setSelectedFiles(acceptedFiles);
    }
  });

  const uploadFiles = async () => {
    if (!selectedFiles.length || !permissions.canUploadDocuments) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${valoracion.id}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('valoracion-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Register document in database
        const { error: dbError } = await (supabase as any)
          .from('valoracion_documents')
          .insert({
            valoracion_id: valoracion.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            content_type: file.type,
            document_type: valoracion.status === 'completed' ? 'deliverable' : 'internal',
            review_status: 'pending',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;

        setUploadProgress(((index + 1) / selectedFiles.length) * 100);
      });

      await Promise.all(uploadPromises);

      toast({
        title: 'Documentos subidos exitosamente',
        description: `Se subieron ${selectedFiles.length} documento(s) para revisión`,
      });

      // Clear selected files and refresh
      setSelectedFiles([]);
      setValidationErrors([]);
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error al subir documentos',
        description: 'Ocurrió un error al subir los documentos. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getPhaseInstructions = () => {
    return getFileTypeDescription(valoracion.status);
  };

  if (!permissions.canUploadDocuments) {
    return (
      <Card className="border-muted">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            {permissions.disabledReason || 'Sin permisos para subir documentos'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subir Documentos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getPhaseInstructions()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          {isDragActive ? (
            <p>Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-sm text-muted-foreground mt-1">
                Máximo 10MB por archivo
              </p>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-1">
              <p className="font-medium">Errores de validación:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Archivos válidos seleccionados:
              </h4>
              <Badge variant="secondary" className="text-xs">
                {selectedFiles.length} archivo(s)
              </Badge>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => {
                const DocumentIcon = getDocumentIcon(file.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subiendo archivos...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <div className="flex justify-end">
          <SecureButton
            hasPermission={permissions.canUploadDocuments && selectedFiles.length > 0 && validationErrors.length === 0}
            disabledReason={
              selectedFiles.length === 0 
                ? 'Selecciona archivos válidos para subir' 
                : validationErrors.length > 0 
                ? 'Corrige los errores de validación'
                : permissions.disabledReason
            }
            onClick={uploadFiles}
            disabled={uploading || validationErrors.length > 0}
          >
            {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} archivo(s)`}
          </SecureButton>
        </div>
      </CardContent>
    </Card>
  );
};
