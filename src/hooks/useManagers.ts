
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Manager } from '@/types/Manager';

export const useManagers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('operation_managers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setManagers(data || []);
    } catch (err) {
      console.error('Error cargando gestores:', err);
      setError('Error al cargar los gestores');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, managerId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${managerId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manager-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('manager-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error subiendo foto:', err);
      throw err;
    }
  };

  const addManager = async (managerData: Omit<Manager, "id" | "created_at" | "updated_at">, photoFile?: File) => {
    try {
      const { data, error } = await supabase
        .from('operation_managers')
        .insert([managerData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Si hay una foto, subirla
      if (photoFile && data) {
        try {
          const photoUrl = await uploadPhoto(photoFile, data.id);
          
          // Actualizar el gestor con la URL de la foto
          const { data: updatedData, error: updateError } = await supabase
            .from('operation_managers')
            .update({ photo: photoUrl })
            .eq('id', data.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error actualizando foto:', updateError);
          } else {
            data.photo = photoUrl;
          }
        } catch (photoError) {
          console.error('Error con la foto, pero gestor creado:', photoError);
        }
      }

      setManagers(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error añadiendo gestor:', err);
      return { data: null, error: 'Error al añadir el gestor' };
    }
  };

  const updateManagerPhoto = async (managerId: string, photoFile: File) => {
    try {
      const photoUrl = await uploadPhoto(photoFile, managerId);
      
      const { data, error } = await supabase
        .from('operation_managers')
        .update({ photo: photoUrl })
        .eq('id', managerId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setManagers(prev => 
        prev.map(manager => 
          manager.id === managerId 
            ? { ...manager, photo: photoUrl }
            : manager
        )
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando foto:', err);
      return { data: null, error: 'Error al actualizar la foto' };
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return { 
    managers, 
    loading, 
    error, 
    refetch: fetchManagers, 
    addManager,
    updateManagerPhoto
  };
};
