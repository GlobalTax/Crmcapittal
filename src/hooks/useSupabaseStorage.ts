
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
      // Verificar si el bucket existe, si no, intentar crearlo
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        toast({
          title: "Error al verificar storage",
          description: bucketsError.message,
          variant: "destructive",
        });
        return null;
      }

      const teaserBucket = buckets?.find(bucket => bucket.id === 'teasers');
      
      if (!teaserBucket) {
        console.log('Bucket "teasers" no existe, intentando crear...');
        const { error: createBucketError } = await supabase.storage.createBucket('teasers', {
          public: true,
          allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });

        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          toast({
            title: "Error al crear bucket",
            description: "No se pudo crear el bucket de storage. Contacta al administrador.",
            variant: "destructive",
          });
          return null;
        }
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${operationId}/${Date.now()}_${file.name}`;
      
      console.log('Subiendo archivo:', fileName);
      
      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('teasers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Error al subir el archivo",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('teasers')
        .getPublicUrl(fileName);

      console.log('Archivo subido exitosamente:', urlData.publicUrl);
      
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
