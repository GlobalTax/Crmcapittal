import React from 'react';
import { Card } from '@/components/ui/card';

export const EmailSettings: React.FC = () => {
  return (
    <Card className="h-full p-6">
      <h2 className="text-lg font-semibold mb-4">Configuración de Email</h2>
      <p className="text-muted-foreground">Configuración aparecerá aquí</p>
    </Card>
  );
};