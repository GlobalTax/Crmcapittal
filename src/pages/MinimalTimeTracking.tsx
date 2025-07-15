import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { UnifiedCard } from "@/components/ui/unified-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { EnhancedCreateTaskDialog } from '@/components/time-tracking/EnhancedCreateTaskDialog';
import { EnhancedManualTimeEntryDialog } from '@/components/time-tracking/EnhancedManualTimeEntryDialog';
import { EnhancedTimeSheet } from '@/components/time-tracking/EnhancedTimeSheet';
import { Clock, CheckCircle, Plus, PlayCircle, Calendar, Timer, BarChart3, FileText } from 'lucide-react';

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

      {/* Tab Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
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
        </TabsContent>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Timer - Full Featured */}
            <UnifiedCard title="Control de Temporizador">
              {dailyData?.activeTimer ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold mb-2">
                      {/* This would show elapsed time - could be enhanced with a real-time counter */}
                      00:00:00
                    </div>
                    <div className="text-muted-foreground">Tiempo transcurrido</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Tarea activa</div>
                    <div className="text-sm text-muted-foreground">
                      Iniciado: {new Date(dailyData.activeTimer.start_time).toLocaleTimeString('es-ES')}
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive"
                    onClick={handleStopTimer}
                    className="w-full"
                    size="lg"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Detener Timer
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No hay timer activo</p>
                  <p className="text-sm text-muted-foreground mb-6">Selecciona una tarea para comenzar</p>
                  <Button onClick={() => setShowCreateTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </div>
              )}
            </UnifiedCard>

            {/* Available Tasks */}
            <UnifiedCard title="Tareas Disponibles">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dailyData?.plannedTasks && dailyData.plannedTasks.length > 0 ? (
                  dailyData.plannedTasks.map((task) => (
                    <div key={task.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                          <Badge 
                            variant={task.status === 'COMPLETED' ? 'default' : 'secondary'} 
                            className="mt-2"
                          >
                            {task.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                          </Badge>
                        </div>
                        {task.status === 'PENDING' && !isTimerRunning && (
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleStartTimer(task.id)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay tareas programadas</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowCreateTask(true)}
                    >
                      Crear Primera Tarea
                    </Button>
                  </div>
                )}
              </div>
            </UnifiedCard>
          </div>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          <EnhancedTimeSheet
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
    </div>
  );
}