
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecurringFee, CreateRecurringFeeData, UpdateRecurringFeeData } from '@/types/RecurringFee';
import { useToast } from '@/hooks/use-toast';

export const useRecurringFees = () => {
  const [recurringFees, setRecurringFees] = useState<RecurringFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecurringFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recurring_fees')
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecurringFees(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cuotas recurrentes';
      setError(errorMessage);
      console.error('Error fetching recurring fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRecurringFee = async (data: CreateRecurringFeeData) => {
    try {
      const { data: newFee, error } = await supabase
        .from('recurring_fees')
        .insert([data])
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title)
        `)
        .single();

      if (error) throw error;

      setRecurringFees(prev => [newFee, ...prev]);
      toast({
        title: "Cuota recurrente creada",
        description: `${newFee.fee_name} ha sido creada correctamente.`,
      });
      return newFee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuota recurrente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateRecurringFee = async (id: string, updates: UpdateRecurringFeeData) => {
    try {
      const { data: updatedFee, error } = await supabase
        .from('recurring_fees')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title)
        `)
        .single();

      if (error) throw error;

      setRecurringFees(prev => 
        prev.map(fee => fee.id === id ? updatedFee : fee)
      );
      toast({
        title: "Cuota recurrente actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedFee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cuota recurrente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deactivateRecurringFee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_fees')
        .update({ is_active: false, end_date: new Date().toISOString().split('T')[0] })
        .eq('id', id);

      if (error) throw error;

      setRecurringFees(prev => prev.filter(fee => fee.id !== id));
      toast({
        title: "Cuota recurrente desactivada",
        description: "La cuota ha sido desactivada correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar cuota recurrente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRecurringFees();
  }, []);

  return {
    recurringFees,
    loading,
    error,
    createRecurringFee,
    updateRecurringFee,
    deactivateRecurringFee,
    refetch: fetchRecurringFees
  };
};
