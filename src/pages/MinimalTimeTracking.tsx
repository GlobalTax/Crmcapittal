import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { UnifiedCard } from "@/components/ui/unified-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { EnhancedCreateTaskDialog } from '@/components/time-tracking/EnhancedCreateTaskDialog';
import { EnhancedManualTimeEntryDialog } from '@/components/time-tracking/EnhancedManualTimeEntryDialog';
import { EnhancedTimeSheet } from '@/components/time-tracking/EnhancedTimeSheet';
import { Clock, CheckCircle, Plus, PlayCircle, Calendar } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Modern Page Header */}
      <PageHeader
        title="Control de Tiempo"
        description="Mide y controla el tiempo dedicado a tus actividades profesionales"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tiempo Total Hoy"
          value={formatTime(dailyData?.timeEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0) || 0)}
          description="Tiempo registrado"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          title="Tareas Completadas"
          value={(dailyData?.plannedTasks.filter(t => t.status === 'COMPLETED').length || 0).toString()}
          description="Finalizadas hoy"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatsCard
          title="Tareas Pendientes"
          value={(dailyData?.plannedTasks.filter(t => t.status === 'PENDING').length || 0).toString()}
          description="Por completar"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatsCard
          title="Timer Activo"
          value={isTimerRunning ? "En curso" : "Parado"}
          description="Estado actual"
          icon={<PlayCircle className="h-5 w-5" />}
          trend={isTimerRunning ? {
            direction: 'up',
            value: 100,
            label: 'activo'
          } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Timer */}
        <UnifiedCard title="Temporizador Activo">
          {dailyData?.activeTimer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Tarea activa</div>
                  <div className="text-sm text-muted-foreground">
                    Iniciado: {new Date(dailyData.activeTimer.start_time).toLocaleTimeString('es-ES')}
                  </div>
                </div>
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <Button 
                variant="outline"
                onClick={handleStopTimer}
                className="w-full"
              >
                Detener Timer
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay timer activo</p>
              <p className="text-sm">Inicia una tarea para comenzar</p>
            </div>
          )}
        </UnifiedCard>

        {/* Tasks List */}
        <UnifiedCard title="Tareas del Día">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dailyData?.plannedTasks && dailyData.plannedTasks.length > 0 ? (
              dailyData.plannedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {task.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                    </Badge>
                    {task.status === 'PENDING' && !isTimerRunning && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartTimer(task.id)}
                      >
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay tareas programadas</p>
              </div>
            )}
          </div>
        </UnifiedCard>
      </div>

      {/* Enhanced Time Entries */}
      <EnhancedTimeSheet
        timeEntries={dailyData?.timeEntries || []}
        onDuplicateEntry={(entry) => setShowManualEntry(true)}
        onContinueTask={(entry) => handleStartTimer()}
        onEditEntry={(entry) => setShowManualEntry(true)}
      />

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
    </div>
  );
}