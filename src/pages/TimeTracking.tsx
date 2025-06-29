
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { ActiveTimer } from '@/components/time-tracking/ActiveTimer';
import { DailyTaskList } from '@/components/time-tracking/DailyTaskList';
import { TimeSheet } from '@/components/time-tracking/TimeSheet';
import { CreateTaskDialog } from '@/components/time-tracking/CreateTaskDialog';
import { ManualTimeEntryDialog } from '@/components/time-tracking/ManualTimeEntryDialog';

const TimeTracking = () => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando datos del día...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mi Día</h1>
        <p className="text-gray-600">Planifica y registra tu tiempo de trabajo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Daily Plan */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plan de Hoy</CardTitle>
              <Button onClick={() => setShowCreateTask(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Tarea
              </Button>
            </CardHeader>
            <CardContent>
              <DailyTaskList 
                tasks={dailyData?.plannedTasks || []}
                onStartTimer={handleStartTimer}
                isTimerRunning={isTimerRunning}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Active Timer & Time Sheet */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temporizador Activo</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveTimer
                activeTimer={dailyData?.activeTimer}
                isTimerRunning={isTimerRunning}
                onStopTimer={handleStopTimer}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hoja de Tiempos del Día</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowManualEntry(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Entrada Manual
              </Button>
            </CardHeader>
            <CardContent>
              <TimeSheet timeEntries={dailyData?.timeEntries || []} />
            </CardContent>
          </Card>
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
};

export default TimeTracking;
