
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const uploadTeaser = async (file: File, operationId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('Iniciando subida de teaser:', file.name, 'para operación:', operationId);
      
      // Verificar que el archivo sea del tipo correcto
      const allowedTypes = [
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        console.error('Tipo de archivo no válido:', file.type);
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF y Word (.pdf, .doc, .docx)",
          variant: "destructive",
        });
        return null;
      }

      // Verificar tamaño del archivo (10MB max)
      if (file.size > 10485760) {
        console.error('Archivo demasiado grande:', file.size);
        toast({
          title: "Archivo demasiado grande",
          description: "El archivo no puede exceder 10MB",
          variant: "destructive",
        });
        return null;
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${operationId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Subiendo archivo con nombre:', fileName);
      
      // Subir archivo directamente a Supabase Storage
      const { data, error } = await supabase.storage
        .from('teasers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        
        // Si el bucket no existe, intentar crearlo
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          console.log('Intentando crear bucket teasers...');
          
          // Crear el bucket si no existe
          const { error: bucketError } = await supabase.storage.createBucket('teasers', {
            public: true,
            allowedMimeTypes: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            fileSizeLimit: 10485760
          });
          
          if (bucketError) {
            console.error('Error creando bucket:', bucketError);
            toast({
              title: "Error de configuración",
              description: "No se pudo configurar el almacenamiento. Contacta al administrador.",
              variant: "destructive",
            });
            return null;
          }
          
          // Intentar subir de nuevo
          const { data: retryData, error: retryError } = await supabase.storage
            .from('teasers')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (retryError) {
            console.error('Error en segundo intento:', retryError);
            toast({
              title: "Error al subir el archivo",
              description: retryError.message,
              variant: "destructive",
            });
            return null;
          }
          
          console.log('Archivo subido en segundo intento:', retryData);
        } else {
          toast({
            title: "Error al subir el archivo",
            description: error.message,
            variant: "destructive",
          });
          return null;
        }
      }

      console.log('Archivo subido exitosamente:', data);

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('teasers')
        .getPublicUrl(fileName);

      console.log('URL pública generada:', urlData.publicUrl);
      
      toast({
        title: "Teaser subido exitosamente",
        description: "El archivo se ha subido correctamente",
      });

      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Error uploading teaser:', error);
      toast({
        title: "Error al subir el archivo",
        description: "No se pudo subir el teaser. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTeaser = async (teaserUrl: string, fileName?: string): Promise<boolean> => {
    setIsDownloading(true);
    
    try {
      console.log('Descargando teaser desde:', teaserUrl);
      
      // Realizar fetch del archivo
      const response = await fetch(teaserUrl);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }
      
      // Convertir a blob
      const blob = await response.blob();
      
      // Crear URL temporal para la descarga
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'teaser.pdf';
      
      // Ejecutar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL temporal
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando",
      });
      
      return true;
      
    } catch (error) {
      console.error('Error downloading teaser:', error);
      toast({
        title: "Error al descargar el archivo",
        description: "No se pudo descargar el teaser. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteTeaser = async (teaserUrl: string): Promise<boolean> => {
    try {
      // Extraer el path del archivo desde la URL
      const url = new URL(teaserUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('teasers') + 1).join('/');
      
      console.log('Eliminando archivo:', filePath);
      
      const { error } = await supabase.storage
        .from('teasers')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      console.log('Archivo eliminado exitosamente');
      return true;
      
    } catch (error) {
      console.error('Error deleting teaser:', error);
      return false;
    }
  };

  return {
    uploadTeaser,
    downloadTeaser,
    deleteTeaser,
    isUploading,
    isDownloading
  };
};
