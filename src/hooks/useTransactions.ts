
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, CreateTransactionData } from '@/types/Transaction';
import { useToast } from '@/hooks/use-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          proposal:proposals(id, title, status),
          company:companies(id, name),
          contact:contacts(id, name, email),
          ndas(*),
          teasers(*),
          info_memos(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      setTransactions((data || []) as Transaction[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar transacciones';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: CreateTransactionData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          created_by: user?.user?.id,
          status: 'nda_pending',
          currency: data.currency || 'EUR'
        }])
        .select(`
          *,
          proposal:proposals(id, title, status),
          company:companies(id, name),
          contact:contacts(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Create transaction error:', error);
        throw new Error(error.message);
      }

      setTransactions(prev => [newTransaction as Transaction, ...prev]);
      toast({
        title: "Transacción creada",
        description: `La transacción ha sido creada correctamente.`,
      });
      return newTransaction as Transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data: updatedTransaction, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          proposal:proposals(id, title, status),
          company:companies(id, name),
          contact:contacts(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Update transaction error:', error);
        throw new Error(error.message);
      }

      setTransactions(prev => 
        prev.map(transaction => transaction.id === id ? updatedTransaction as Transaction : transaction)
      );
      
      toast({
        title: "Transacción actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedTransaction as Transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const createTransactionFromProposal = async (proposalId: string) => {
    try {
      // First get the proposal details
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Proposal fetch error:', proposalError);
        throw new Error(proposalError.message);
      }

      const transactionData: CreateTransactionData = {
        proposal_id: proposalId,
        company_id: proposal.company_id,
        contact_id: proposal.contact_id,
        transaction_type: 'sale',
        estimated_value: proposal.total_amount,
        currency: proposal.currency || 'EUR',
        priority: 'medium'
      };

      return await createTransaction(transactionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear transacción desde propuesta';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    createTransactionFromProposal,
    refetch: fetchTransactions
  };
};
