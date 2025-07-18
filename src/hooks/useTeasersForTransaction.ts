import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Teaser = Database['public']['Tables']['teasers']['Row'];

export function useTeasersForTransaction(transactionId: string) {
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
        .eq('transaction_id', transactionId)
        .in('teaser_type', ['venta', 'standalone'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeasers(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching teasers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeaser = async (teaserData: Partial<Teaser> & { title: string }) => {
    try {
      const { error } = await supabase
        .from('teasers')
        .insert({
          title: teaserData.title,
          anonymous_company_name: teaserData.anonymous_company_name || 'Nueva Empresa',
          transaction_id: transactionId,
          teaser_type: 'venta',
          status: teaserData.status || 'borrador',
          currency: 'EUR',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          ...teaserData
        });

      if (error) throw error;
      
      toast({ title: 'Teaser creado correctamente' });
      fetchTeasers();
    } catch (err) {
      console.error('Error creating teaser:', err);
      toast({
        title: 'Error al crear el teaser',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    }
  };

  const updateTeaser = async (teaserId: string, teaserData: Partial<Teaser>) => {
    try {
      const { error } = await supabase
        .from('teasers')
        .update(teaserData)
        .eq('id', teaserId);

      if (error) throw error;
      
      toast({ title: 'Teaser actualizado correctamente' });
      fetchTeasers();
    } catch (err) {
      console.error('Error updating teaser:', err);
      toast({
        title: 'Error al actualizar el teaser',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    }
  };

  const duplicateTeaser = async (teaser: Teaser) => {
    try {
      const { id, created_at, updated_at, ...teaserData } = teaser;
      await createTeaser({
        ...teaserData,
        title: `${teaser.title} (Copia)`,
        status: 'borrador'
      });
    } catch (err) {
      console.error('Error duplicating teaser:', err);
      toast({
        title: 'Error al duplicar el teaser',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    }
  };

  const deleteTeaser = async (teaserId: string) => {
    try {
      const { error } = await supabase
        .from('teasers')
        .delete()
        .eq('id', teaserId);

      if (error) throw error;
      
      toast({ title: 'Teaser eliminado correctamente' });
      fetchTeasers();
    } catch (err) {
      console.error('Error deleting teaser:', err);
      toast({
        title: 'Error al eliminar el teaser',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchTeasers();
    }
  }, [transactionId]);

  return {
    teasers,
    loading,
    error,
    createTeaser,
    updateTeaser,
    deleteTeaser,
    duplicateTeaser,
    refetch: fetchTeasers
  };
}