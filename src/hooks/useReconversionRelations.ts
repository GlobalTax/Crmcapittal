import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type BuyingMandate = Database['public']['Tables']['buying_mandates']['Row'];
type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

export function useReconversionRelations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Obtener reconversiones por lead original
  const getReconversionsByLead = async (leadId: string): Promise<Reconversion[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .eq('original_lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener reconversiones por mandato original
  const getReconversionsByMandate = async (mandateId: string): Promise<Reconversion[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .eq('original_mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de estados de una reconversión  
  const getStatusHistory = async (reconversionId: string) => {
    try {
      setLoading(true);
      // Por ahora devolver array vacío hasta que las nuevas tablas estén en types.ts
      return [];
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar leads disponibles para vincular
  const searchAvailableLeads = async (query: string): Promise<Lead[]> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  // Buscar mandatos disponibles para vincular
  const searchAvailableMandates = async (query: string): Promise<BuyingMandate[]> => {
    try {
      const { data, error } = await supabase
        .from('buying_mandates')
        .select('*')
        .or(`mandate_name.ilike.%${query}%,client_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  // Vincular reconversión con lead
  const linkToLead = async (reconversionId: string, leadId: string) => {
    try {
      const { error } = await supabase
        .from('reconversiones')
        .update({ original_lead_id: leadId })
        .eq('id', reconversionId);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Vincular reconversión con mandato
  const linkToMandate = async (reconversionId: string, mandateId: string) => {
    try {
      const { error } = await supabase
        .from('reconversiones')
        .update({ original_mandate_id: mandateId })
        .eq('id', reconversionId);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    loading,
    error,
    getReconversionsByLead,
    getReconversionsByMandate,
    getStatusHistory,
    searchAvailableLeads,
    searchAvailableMandates,
    linkToLead,
    linkToMandate
  };
}