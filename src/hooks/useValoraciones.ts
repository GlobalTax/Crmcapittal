
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];
type CreateValoracionData = Database['public']['Tables']['valoraciones']['Insert'];

export function useValoraciones() {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchValoraciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setValoraciones(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createValoracion = async (valoracionData: CreateValoracionData) => {
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .insert([valoracionData])
        .select()
        .single();

      if (error) throw error;
      
      setValoraciones(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateValoracion = async (id: string, updates: Partial<CreateValoracionData>) => {
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setValoraciones(prev => 
        prev.map(v => v.id === id ? { ...v, ...data } : v)
      );
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteValoracion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('valoraciones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setValoraciones(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  useEffect(() => {
    fetchValoraciones();
  }, []);

  return {
    valoraciones,
    loading,
    error,
    createValoracion,
    updateValoracion,
    deleteValoracion,
    refetch: fetchValoraciones
  };
}
