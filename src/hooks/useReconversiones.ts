import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];
type UpdateReconversionData = Database['public']['Tables']['reconversiones']['Update'];

export function useReconversiones() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReconversiones = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReconversiones(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reconversiones';
      setError(err as Error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createReconversion = async (reconversionData: CreateReconversionData) => {
    try {
      const { data, error } = await supabase
        .from('reconversiones')
        .insert([reconversionData])
        .select()
        .single();

      if (error) throw error;
      
      setReconversiones(prev => [data, ...prev]);
      toast.success('Reconversión creada correctamente');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear reconversión';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateReconversion = async (id: string, updates: UpdateReconversionData) => {
    try {
      const { data, error } = await supabase
        .from('reconversiones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReconversiones(prev => 
        prev.map(r => r.id === id ? { ...r, ...data } : r)
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar reconversión';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteReconversion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reconversiones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReconversiones(prev => prev.filter(r => r.id !== id));
      toast.success('Reconversión eliminada correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar reconversión';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchReconversiones();
  }, []);

  return {
    reconversiones,
    loading,
    error,
    createReconversion,
    updateReconversion,
    deleteReconversion,
    refetch: fetchReconversiones
  };
}