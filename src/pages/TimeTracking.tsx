
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { ProductivityDashboard } from '@/components/time-tracking/ProductivityDashboard';
import { TimeEntriesList } from '@/components/time-tracking/TimeEntriesList';
import { TimeGoalsDialog } from '@/components/time-tracking/TimeGoalsDialog';

const TimeTracking = () => {
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-600 mt-2">
              Registra y analiza tu tiempo de trabajo
            </p>
          </div>
          <Button onClick={() => setShowGoalsDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Objetivo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tracker" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tracker">Timer</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="entries">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker">
          <div className="max-w-md mx-auto">
            <TimeTracker />
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <ProductivityDashboard />
        </TabsContent>

        <TabsContent value="entries">
          <TimeEntriesList />
        </TabsContent>
      </Tabs>

      <TimeGoalsDialog 
        open={showGoalsDialog}
        onOpenChange={setShowGoalsDialog}
      />
    </div>
  );
};

export default TimeTracking;
