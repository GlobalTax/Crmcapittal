import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Teaser = Database['public']['Tables']['teasers']['Row'];
type CreateTeaserData = Database['public']['Tables']['teasers']['Insert'];

export function useTeasers() {
  const [teasers, setTeasers] = useState<Teaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeasers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teasers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeasers(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTeaser = async (teaserData: CreateTeaserData) => {
    try {
      const { data, error } = await supabase
        .from('teasers')
        .insert([teaserData])
        .select()
        .single();

      if (error) throw error;
      
      setTeasers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateTeaser = async (id: string, updates: Partial<CreateTeaserData>) => {
    try {
      const { data, error } = await supabase
        .from('teasers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTeasers(prev => 
        prev.map(t => t.id === id ? { ...t, ...data } : t)
      );
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTeaser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teasers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeasers(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  useEffect(() => {
    fetchTeasers();
  }, []);

  return {
    teasers,
    loading,
    error,
    createTeaser,
    updateTeaser,
    deleteTeaser,
    refetch: fetchTeasers
  };
}