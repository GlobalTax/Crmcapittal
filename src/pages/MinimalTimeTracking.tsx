import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { EnhancedCreateTaskDialog } from '@/components/time-tracking/EnhancedCreateTaskDialog';
import { EnhancedManualTimeEntryDialog } from '@/components/time-tracking/EnhancedManualTimeEntryDialog';
import { FloatingTimer } from '@/components/time-tracking/FloatingTimer';
import { QuickStart } from '@/components/time-tracking/QuickStart';
import { EnhancedDashboard } from '@/components/time-tracking/EnhancedDashboard';
import { EnhancedTimeline } from '@/components/time-tracking/EnhancedTimeline';
import { Plus, Timer, BarChart3, FileText, Activity, Zap } from 'lucide-react';

export default function MinimalTimeTracking() {
  const today = new Date().toISOString().split('T')[0];
  const { dailyData, isLoading, isTimerRunning, startTimer, stopTimer, createPlannedTask } = useTimeTracking(today);
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleStartTimer = async (plannedTaskId?: string) => {
    try {
      await startTimer(plannedTaskId);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos del día...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Modern Page Header */}
      <PageHeader
        title="Control de Tiempo"
        description="Sistema avanzado de seguimiento y gestión del tiempo"
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => setShowManualEntry(true)}
            >
              Entrada Manual
            </Button>
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </>
        }
      />

      {/* Tab Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Inicio Rápido
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <EnhancedDashboard 
            dailyData={dailyData || { plannedTasks: [], timeEntries: [] }}
            isTimerRunning={isTimerRunning}
          />
        </TabsContent>

        {/* Timer/Quick Start Tab */}
        <TabsContent value="timer" className="space-y-6">
          <QuickStart onTimerStarted={() => {}} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <EnhancedTimeline
            timeEntries={dailyData?.timeEntries || []}
            onDuplicateEntry={(entry) => setShowManualEntry(true)}
            onContinueTask={(entry) => handleStartTimer()}
            onEditEntry={(entry) => setShowManualEntry(true)}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Reportes y Análisis</p>
            <p className="text-sm text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Dialogs */}
      <EnhancedCreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onCreateTask={createPlannedTask}
        defaultDate={today}
      />

      <EnhancedManualTimeEntryDialog
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
      />

      {/* Floating Timer */}
      <FloatingTimer />
    </div>
  );
}