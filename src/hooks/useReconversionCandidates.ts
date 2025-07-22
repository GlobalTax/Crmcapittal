import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReconversionCandidate {
  id: string;
  reconversion_id: string;
  company_id?: string;
  company_name: string;
  company_sector?: string;
  company_location?: string;
  company_revenue?: number;
  company_ebitda?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_status: string;
  contact_date?: string;
  contact_method?: string;
  contact_notes?: string;
  match_score?: number;
  match_criteria?: any;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReconversionCandidateData {
  reconversion_id: string;
  company_id?: string;
  company_name: string;
  company_sector?: string;
  company_location?: string;
  company_revenue?: number;
  company_ebitda?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_status?: string;
  contact_date?: string;
  contact_method?: string;
  contact_notes?: string;
  match_score?: number;
  match_criteria?: any;
  created_by?: string;
  assigned_to?: string;
}

export interface UpdateReconversionCandidateData {
  company_id?: string;
  company_name?: string;
  company_sector?: string;
  company_location?: string;
  company_revenue?: number;
  company_ebitda?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_status?: string;
  contact_date?: string;
  contact_method?: string;
  contact_notes?: string;
  match_score?: number;
  match_criteria?: any;
  assigned_to?: string;
}

export function useReconversionCandidates(reconversionId?: string) {
  const [candidates, setCandidates] = useState<ReconversionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCandidates = async () => {
    if (!reconversionId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('reconversion_candidates' as any)
        .select('*')
        .eq('reconversion_id', reconversionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates((data || []) as unknown as ReconversionCandidate[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar candidatos';
      setError(err as Error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addCandidate = async (candidateData: CreateReconversionCandidateData) => {
    try {
      const { data, error } = await supabase
        .from('reconversion_candidates' as any)
        .insert([candidateData])
        .select()
        .single();

      if (error) throw error;
      
      setCandidates(prev => [data as unknown as ReconversionCandidate, ...prev]);
      toast.success('Candidato agregado correctamente');
      return data as unknown as ReconversionCandidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar candidato';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateCandidate = async (id: string, updates: UpdateReconversionCandidateData) => {
    try {
      const { data, error } = await supabase
        .from('reconversion_candidates' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCandidates(prev => 
        prev.map(c => c.id === id ? { ...c, ...(data as unknown as ReconversionCandidate) } : c)
      );
      toast.success('Candidato actualizado correctamente');
      return data as unknown as ReconversionCandidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar candidato';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reconversion_candidates' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCandidates(prev => prev.filter(c => c.id !== id));
      toast.success('Candidato eliminado correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar candidato';
      setError(err as Error);
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [reconversionId]);

  return {
    candidates,
    loading,
    error,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    refetch: fetchCandidates
  };
}