import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WinbackDashboard } from '@/components/winback/WinbackDashboard';
import { WinbackSequenceManager } from '@/components/winback/WinbackSequenceManager';

export default function WinbackPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema Winback</h1>
        <p className="text-muted-foreground">
          Gestiona la reactivación automática de leads perdidos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sequences">Secuencias</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <WinbackDashboard />
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <WinbackSequenceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}