
import { useState } from "react";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { Operation } from "@/types/Operation";

export const useTeaserUpload = (
  operation: Operation | null,
  onUploadComplete: (operationId: string, teaserUrl: string) => void,
  onClose: () => void
) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadTeaser, isUploading, deleteTeaser } = useSupabaseStorage();

  const isReplacingTeaser = operation?.teaser_url;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      console.log('Archivo seleccionado:', file.name, file.type, file.size);
      
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Solo se permiten archivos PDF, DOC y DOCX');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede exceder 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !operation) {
      console.error('No hay archivo seleccionado o operación');
      setUploadError('Selecciona un archivo válido');
      return;
    }

    console.log('Iniciando subida para operación:', operation.id);
    setUploadError(null);

    try {
      if (isReplacingTeaser && operation.teaser_url) {
        console.log('Eliminando teaser anterior:', operation.teaser_url);
        await deleteTeaser(operation.teaser_url);
      }

      const teaserUrl = await uploadTeaser(selectedFile, operation.id);
      
      if (teaserUrl) {
        console.log('Subida exitosa, URL:', teaserUrl);
        onUploadComplete(operation.id, teaserUrl);
        resetDialog();
        onClose();
      } else {
        setUploadError('Error al subir el archivo. Verifica que el archivo sea válido.');
      }
    } catch (error) {
      console.error('Error en handleUpload:', error);
      setUploadError('Error inesperado al subir el archivo. Inténtalo de nuevo.');
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  return {
    selectedFile,
    uploadError,
    isUploading,
    isReplacingTeaser,
    handleFileSelect,
    handleUpload,
    resetDialog
  };
};
