
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

  const addManager = async (managerData: Omit<Manager, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from('operation_managers')
        .insert([managerData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setManagers(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error añadiendo gestor:', err);
      return { data: null, error: 'Error al añadir el gestor' };
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return { managers, loading, error, refetch: fetchManagers, addManager };
};
