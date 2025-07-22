
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { SecureButton } from './SecureButton';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';
import { Valoracion } from '@/types/Valoracion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/useToast';

interface ValoracionDocumentUploaderProps {
  valoracion: Valoracion;
  onUploadComplete?: () => void;
}

const ALLOWED_FILE_TYPES = {
  'requested': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'in_process': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'completed': ['application/pdf'],
  'delivered': [] // No se pueden subir documentos después de entregar
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ValoracionDocumentUploader = ({ 
  valoracion, 
  onUploadComplete 
}: ValoracionDocumentUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const permissions = useValoracionPermissions(valoracion);

  const allowedTypes = ALLOWED_FILE_TYPES[valoracion.status] || [];

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, rejectedFiles } = useDropzone({
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: !permissions.canUploadDocuments || uploading
  });

  const uploadFiles = async () => {
    if (!acceptedFiles.length || !permissions.canUploadDocuments) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${valoracion.id}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('valoracion-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Registrar el documento en la base de datos
        const { error: dbError } = await supabase
          .from('valoracion_documents')
          .insert({
            valoracion_id: valoracion.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            content_type: file.type,
            document_type: valoracion.status === 'completed' ? 'deliverable' : 'internal',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;

        setUploadProgress(((index + 1) / acceptedFiles.length) * 100);
      });

      await Promise.all(uploadPromises);

      toast({
        title: 'Documentos subidos exitosamente',
        description: `Se subieron ${acceptedFiles.length} documento(s)`,
      });

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

  const getPhaseInstructions = () => {
    switch (valoracion.status) {
      case 'requested':
        return 'Puedes subir documentos de solicitud (PDF, Word)';
      case 'in_process':
        return 'Puedes subir documentos de trabajo (PDF, Word, Excel)';
      case 'completed':
        return 'Solo documentos finales en PDF para entregar al cliente';
      case 'delivered':
        return 'No se pueden subir más documentos después de la entrega';
      default:
        return '';
    }
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

        {acceptedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Archivos seleccionados:</h4>
            {acceptedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {rejectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Archivos rechazados:</h4>
            {rejectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm">{file.file.name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {file.errors[0]?.message}
                  </Badge>
                </div>
              </div>
            ))}
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
            hasPermission={permissions.canUploadDocuments && acceptedFiles.length > 0}
            disabledReason={acceptedFiles.length === 0 ? 'Selecciona archivos para subir' : permissions.disabledReason}
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : `Subir ${acceptedFiles.length} archivo(s)`}
          </SecureButton>
        </div>
      </CardContent>
    </Card>
  );
};
