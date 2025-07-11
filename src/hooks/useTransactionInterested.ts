import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TransactionInterestedPartyRow = Database['public']['Tables']['transaction_interested_parties']['Row'];

export interface TransactionInterestedParty {
  id: string;
  transaction_id: string;
  contact_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  interest_level: 'initial' | 'low' | 'medium' | 'high' | 'very_high';
  process_status: 'initial' | 'teaser_sent' | 'nda_signed' | 'due_diligence' | 'offer_submitted' | 'negotiation' | 'closed_won' | 'closed_lost';
  financial_capacity?: number | null;
  score: number;
  notes?: string | null;
  documents_shared?: string[] | null;
  last_interaction_date?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export const useTransactionInterested = (transactionId: string) => {
  const [interestedParties, setInterestedParties] = useState<TransactionInterestedParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInterestedParties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transaction_interested_parties')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setInterestedParties((data || []) as TransactionInterestedParty[]);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los interesados"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addInterestedParty = async (party: Omit<TransactionInterestedParty, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transaction_interested_parties')
        .insert([party])
        .select()
        .single();

      if (error) throw error;

      setInterestedParties(prev => [data as TransactionInterestedParty, ...prev]);
      toast({
        title: "Éxito",
        description: "Interesado añadido correctamente"
      });

      return data;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el interesado"
      });
      throw err;
    }
  };

  const updateInterestedParty = async (id: string, updates: Partial<TransactionInterestedParty>) => {
    try {
      const { data, error } = await supabase
        .from('transaction_interested_parties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInterestedParties(prev => 
        prev.map(party => party.id === id ? { ...party, ...data as TransactionInterestedParty } : party)
      );

      toast({
        title: "Éxito",
        description: "Interesado actualizado correctamente"
      });

      return data;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el interesado"
      });
      throw err;
    }
  };

  const deleteInterestedParty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transaction_interested_parties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInterestedParties(prev => prev.filter(party => party.id !== id));
      toast({
        title: "Éxito",
        description: "Interesado eliminado correctamente"
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el interesado"
      });
      throw err;
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchInterestedParties();
    }
  }, [transactionId]);

  return {
    interestedParties,
    isLoading,
    error,
    addInterestedParty,
    updateInterestedParty,
    deleteInterestedParty,
    refetch: fetchInterestedParties
  };
};