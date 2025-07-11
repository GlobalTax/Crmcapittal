import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Commission {
  id: string;
  collaborator_id: string;
  lead_id?: string;
  deal_id?: string;
  commission_amount: number;
  commission_percentage?: number;
  status: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  source_type?: string;
  source_name?: string;
  payment_due_date?: string;
  collaborators: {
    name: string;
    collaborator_type: string;
  };
}

export const useCommissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborator_commissions')
        .select(`
          *,
          collaborators(name, collaborator_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCommissions(data || []);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError('Error al cargar comisiones');
      toast({
        title: "Error",
        description: "No se pudieron cargar las comisiones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveCommissions = async (commissionIds: string[]) => {
    try {
      const { error } = await supabase
        .from('collaborator_commissions')
        .update({
          status: 'paid',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .in('id', commissionIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${commissionIds.length} comisiones aprobadas correctamente`
      });

      await fetchCommissions();
    } catch (err) {
      console.error('Error approving commissions:', err);
      toast({
        title: "Error",
        description: "No se pudieron aprobar las comisiones",
        variant: "destructive"
      });
    }
  };

  const updateCommissionStatus = async (commissionId: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'paid') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = (await supabase.auth.getUser()).data.user?.id;
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('collaborator_commissions')
        .update(updates)
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Comisión ${status === 'paid' ? 'aprobada' : 'cancelada'} correctamente`
      });

      await fetchCommissions();
    } catch (err) {
      console.error('Error updating commission status:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la comisión",
        variant: "destructive"
      });
    }
  };

  const createCommission = async (commissionData: {
    collaborator_id: string;
    commission_amount: number;
    commission_percentage?: number;
    source_type: string;
    source_name?: string;
    lead_id?: string;
    deal_id?: string;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('collaborator_commissions')
        .insert({
          ...commissionData,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Comisión creada correctamente"
      });

      await fetchCommissions();
    } catch (err) {
      console.error('Error creating commission:', err);
      toast({
        title: "Error",
        description: "No se pudo crear la comisión",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  return {
    commissions,
    loading,
    error,
    approveCommissions,
    updateCommissionStatus,
    createCommission,
    refetch: fetchCommissions
  };
};