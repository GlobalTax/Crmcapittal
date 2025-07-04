import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactFile {
  id: string;
  contact_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export function useContactFiles(contactId?: string) {
  const [files, setFiles] = useState<ContactFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contact_files')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setFiles((data || []) as ContactFile[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Agregar archivo
  const addFile = async (file: Omit<ContactFile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_files')
        .insert([file])
        .select()
        .single();
        
      if (error) throw error;
      setFiles((prev) => [data as ContactFile, ...prev]);
      return data as ContactFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar archivo');
      throw err;
    }
  };

  // Eliminar archivo
  const deleteFile = async (id: string) => {
    try {
      // Primero obtener la información del archivo para eliminar del storage
      const fileToDelete = files.find(f => f.id === id);
      
      // Eliminar de la base de datos
      const { error } = await supabase
        .from('contact_files')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Eliminar del storage si existe la información del archivo
      if (fileToDelete?.file_url) {
        try {
          // Extraer el path del archivo desde la URL
          const url = new URL(fileToDelete.file_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(pathParts.indexOf('contact-files') + 1).join('/');
          
          await supabase.storage
            .from('contact-files')
            .remove([filePath]);
        } catch (storageError) {
          console.warn('Error al eliminar archivo del storage:', storageError);
          // No lanzamos error aquí porque el registro de BD ya se eliminó
        }
      }
      
      setFiles((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar archivo');
      throw err;
    }
  };

  return {
    files,
    loading,
    error,
    fetchFiles,
    addFile,
    deleteFile,
  };
}