import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { CreateTaskDialog } from '@/components/time-tracking/CreateTaskDialog';
import { ManualTimeEntryDialog } from '@/components/time-tracking/ManualTimeEntryDialog';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Tiempo</h1>
          <p className="text-gray-600 mt-1">Mide y controla el tiempo dedicado a tus actividades</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => setShowManualEntry(true)}
          >
            Entrada Manual
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowCreateTask(true)}
          >
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Tiempo Total Hoy</span>
          <span className="text-3xl font-bold mt-2 block">
            {formatTime(dailyData?.timeEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0) || 0)}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Tareas Completadas</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {dailyData?.plannedTasks.filter(t => t.status === 'COMPLETED').length || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Tareas Pendientes</span>
          <span className="text-3xl font-bold mt-2 block text-blue-600">
            {dailyData?.plannedTasks.filter(t => t.status === 'PENDING').length || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Timer Activo</span>
          <span className="text-3xl font-bold mt-2 block">
            {isTimerRunning ? (
              <Badge color="green">En curso</Badge>
            ) : (
              <Badge color="gray">Parado</Badge>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Timer */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Temporizador Activo</h3>
          </div>
          <div className="p-4">
            {dailyData?.activeTimer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Tarea activa</div>
                    <div className="text-sm text-gray-500">
                      Iniciado: {new Date(dailyData.activeTimer.start_time).toLocaleTimeString('es-ES')}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Button 
                  variant="secondary"
                  onClick={handleStopTimer}
                  className="w-full"
                >
                  Detener Timer
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay timer activo</p>
                <p className="text-sm">Inicia una tarea para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Tareas del Día</h3>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {dailyData?.plannedTasks && dailyData.plannedTasks.length > 0 ? (
              dailyData.plannedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={task.status === 'COMPLETED' ? 'green' : 'blue'}>
                      {task.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                    </Badge>
                    {task.status === 'PENDING' && !isTimerRunning && (
                      <Button 
                        variant="secondary" 
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
              <div className="text-center py-8 text-gray-500">
                <p>No hay tareas programadas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Registro de Tiempo</h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Tarea</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Fecha</TableHead>
            </TableHeader>
            <TableBody>
              {dailyData?.timeEntries && dailyData.timeEntries.length > 0 ? (
                dailyData.timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">Entrada de tiempo</div>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.start_time).toLocaleTimeString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {entry.end_time ? new Date(entry.end_time).toLocaleTimeString('es-ES') : 'En curso'}
                    </TableCell>
                    <TableCell>
                      {formatTime(entry.duration_minutes || 0)}
                    </TableCell>
                    <TableCell>
                      {formatDate(entry.start_time)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-500">
                    No hay entradas de tiempo registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onCreateTask={createPlannedTask}
        defaultDate={today}
      />

      <ManualTimeEntryDialog
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
      />
    </div>
  );
}