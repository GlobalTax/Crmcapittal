import React from 'react';
import { Card } from '@/components/ui/card';

export const EmailAnalytics: React.FC = () => {
  return (
    <Card className="h-full p-6">
      <h2 className="text-lg font-semibold mb-4">Analytics de Email</h2>
      <p className="text-muted-foreground">Métricas y analytics aparecerán aquí</p>
    </Card>
  );
};