
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal, CreateProposalData, UpdateProposalData } from '@/types/Proposal';
import { useToast } from '@/hooks/use-toast';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data || []) as Proposal[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar propuestas';
      setError(errorMessage);
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (data: CreateProposalData) => {
    try {
      const { data: newProposal, error } = await supabase
        .from('proposals')
        .insert([data])
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .single();

      if (error) throw error;

      setProposals(prev => [newProposal as Proposal, ...prev]);
      toast({
        title: "Propuesta creada",
        description: `${newProposal.title} ha sido creada correctamente.`,
      });
      return newProposal as Proposal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear propuesta';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateProposal = async (id: string, updates: UpdateProposalData) => {
    try {
      const { data: updatedProposal, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .single();

      if (error) throw error;

      setProposals(prev => 
        prev.map(proposal => proposal.id === id ? updatedProposal as Proposal : proposal)
      );
      toast({
        title: "Propuesta actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedProposal as Proposal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar propuesta';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProposals(prev => prev.filter(proposal => proposal.id !== id));
      toast({
        title: "Propuesta eliminada",
        description: "La propuesta ha sido eliminada correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar propuesta';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const approveProposal = async (id: string) => {
    try {
      const { data: approvedProposal, error } = await supabase
        .from('proposals')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .single();

      if (error) throw error;

      setProposals(prev => 
        prev.map(proposal => proposal.id === id ? approvedProposal as Proposal : proposal)
      );
      toast({
        title: "Propuesta aprobada",
        description: "La propuesta ha sido aprobada y está lista para generar expediente.",
        variant: "default",
      });
      return approvedProposal as Proposal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar propuesta';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    approveProposal,
    refetch: fetchProposals
  };
};
