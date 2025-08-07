import React from 'react';
import { Card } from '@/components/ui/card';
import { EmailFilter } from '../types';

interface EmailInboxProps {
  searchQuery: string;
  filter: EmailFilter;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({ searchQuery, filter }) => {
  return (
    <Card className="h-full p-6">
      <h2 className="text-lg font-semibold mb-4">
        {filter.direction === 'incoming' ? 'Bandeja de entrada' : 'Emails enviados'}
      </h2>
      <p className="text-muted-foreground">Lista de emails aparecerá aquí</p>
    </Card>
  );
};