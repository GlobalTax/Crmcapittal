import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TransactionSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function TransactionSelector({ value, onValueChange }: TransactionSelectorProps) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, 
          transaction_code, 
          transaction_type,
          companies!inner(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Transacción</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-select">Transacción *</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="transaction-select">
          <SelectValue placeholder="Selecciona una transacción" />
        </SelectTrigger>
        <SelectContent>
          {transactions.map((transaction) => (
            <SelectItem key={transaction.id} value={transaction.id}>
              {transaction.companies?.name || transaction.transaction_code} - {transaction.transaction_type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}