import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BuyingMandate, CreateBuyingMandateData, MandateTarget, CreateMandateTargetData } from '@/types/BuyingMandate';

export const useBuyingMandates = () => {
  const [mandates, setMandates] = useState<BuyingMandate[]>([]);
  const [targets, setTargets] = useState<MandateTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMandates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMandates((data || []) as BuyingMandate[]);
    } catch (error) {
      console.error('Error fetching mandates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mandatos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargets = async (mandateId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('mandate_targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (mandateId) {
        query = query.eq('mandate_id', mandateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTargets((data || []) as MandateTarget[]);
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los targets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMandate = async (mandateData: CreateBuyingMandateData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('buying_mandates')
        .insert({
          ...mandateData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Mandato creado correctamente',
      });

      await fetchMandates();
      return data;
    } catch (error) {
      console.error('Error creating mandate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el mandato',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createTarget = async (targetData: CreateMandateTargetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('mandate_targets')
        .insert({
          ...targetData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Target añadido correctamente',
      });

      await fetchTargets(targetData.mandate_id);
      return data;
    } catch (error) {
      console.error('Error creating target:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el target',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTarget = async (targetId: string, updates: Partial<MandateTarget>) => {
    try {
      const { error } = await supabase
        .from('mandate_targets')
        .update(updates)
        .eq('id', targetId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Target actualizado correctamente',
      });

      const target = targets.find(t => t.id === targetId);
      if (target) {
        await fetchTargets(target.mandate_id);
      }
    } catch (error) {
      console.error('Error updating target:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el target',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMandateStatus = async (mandateId: string, status: BuyingMandate['status']) => {
    try {
      const { error } = await supabase
        .from('buying_mandates')
        .update({ status })
        .eq('id', mandateId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Estado del mandato actualizado',
      });

      await fetchMandates();
    } catch (error) {
      console.error('Error updating mandate status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del mandato',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  return {
    mandates,
    targets,
    isLoading,
    fetchMandates,
    fetchTargets,
    createMandate,
    createTarget,
    updateTarget,
    updateMandateStatus,
  };
};