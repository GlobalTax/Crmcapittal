
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOperations(data || []);
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError('Error al cargar las operaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  return { operations, loading, error, refetch: fetchOperations };
};
