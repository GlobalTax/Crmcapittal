import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useOperations } from '@/hooks/useOperations';

interface TransactionSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function TransactionSelector({ value, onValueChange }: TransactionSelectorProps) {
  const { operations, loading } = useOperations();

  if (loading) {
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
          {operations.map((operation) => (
            <SelectItem key={operation.id} value={operation.id}>
              {operation.company_name} - {operation.operation_type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}