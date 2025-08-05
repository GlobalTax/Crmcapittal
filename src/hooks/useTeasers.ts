import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Teaser = Database['public']['Tables']['teasers']['Row'];
type CreateTeaserData = Database['public']['Tables']['teasers']['Insert'];

export function useTeasers() {
  const [teasers, setTeasers] = useState<Teaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

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
      // Validate required fields
      if (!teaserData.title) {
        throw new Error('El título es requerido');
      }
      if (!teaserData.transaction_id) {
        throw new Error('La transacción es requerida');
      }
      if (!teaserData.anonymous_company_name) {
        throw new Error('El nombre anónimo de la empresa es requerido');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Validate operation exists in the operations table
      const { data: operationData, error: operationError } = await supabase
        .from('operations')
        .select('id, company_name')
        .eq('id', teaserData.transaction_id)
        .single();

      if (operationError || !operationData) {
        console.error('Operation validation error:', operationError);
        console.log('Checking operation ID:', teaserData.transaction_id);
        throw new Error('La operación seleccionada no existe o no es válida');
      }

      const insertData = {
        ...teaserData,
        teaser_type: teaserData.teaser_type || 'blind',
        status: teaserData.status || 'draft',
        currency: teaserData.currency || 'EUR',
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('teasers')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23503') {
          throw new Error('La transacción seleccionada no existe');
        }
        throw new Error(`Error en la base de datos: ${error.message}`);
      }
      
      setTeasers(prev => [data, ...prev]);
      toast({
        title: 'Teaser creado',
        description: 'El teaser se ha creado correctamente'
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error creating teaser:', err);
      setError(err as Error);
      toast({
        title: 'Error al crear teaser',
        description: errorMessage,
        variant: 'destructive'
      });
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