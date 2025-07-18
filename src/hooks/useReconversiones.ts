import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];

export function useReconversiones() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReconversiones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReconversiones(data || []);
    } catch (err) {
      setError(err as Error);
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
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateReconversion = async (id: string, updates: Partial<CreateReconversionData>) => {
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
      setError(err as Error);
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
    } catch (err) {
      setError(err as Error);
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