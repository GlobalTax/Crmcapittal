
import React, { useState } from 'react';
import { Plus, Clock, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { ActiveTimer } from '@/components/time-tracking/ActiveTimer';
import { DailyTaskList } from '@/components/time-tracking/DailyTaskList';
import { TimeSheet } from '@/components/time-tracking/TimeSheet';
import { CreateTaskDialog } from '@/components/time-tracking/CreateTaskDialog';
import { ManualTimeEntryDialog } from '@/components/time-tracking/ManualTimeEntryDialog';
import { TimeTrackingStats } from '@/components/time-tracking/TimeTrackingStats';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del día...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracking</h1>
              <p className="text-gray-600">Gestiona tu tiempo y productividad de manera eficiente</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                className="border-gray-300"
              >
                <Clock className="w-4 h-4 mr-2" />
                Entrada Manual
              </Button>
              <Button 
                onClick={() => setShowCreateTask(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <TimeTrackingStats timeEntries={dailyData?.timeEntries || []} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Timer and Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Timer */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Temporizador Activo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ActiveTimer
                  activeTimer={dailyData?.activeTimer}
                  isTimerRunning={isTimerRunning}
                  onStopTimer={handleStopTimer}
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Resumen del Día
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiempo Total</span>
                    <span className="font-semibold text-gray-900">
                      {dailyData?.timeEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0) || 0} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tareas Completadas</span>
                    <span className="font-semibold text-gray-900">
                      {dailyData?.plannedTasks.filter(t => t.status === 'COMPLETED').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tareas Pendientes</span>
                    <span className="font-semibold text-gray-900">
                      {dailyData?.plannedTasks.filter(t => t.status === 'PENDING').length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tasks and Time Entries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks List */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Plan de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <DailyTaskList 
                  tasks={dailyData?.plannedTasks || []}
                  onStartTimer={handleStartTimer}
                  isTimerRunning={isTimerRunning}
                />
              </CardContent>
            </Card>

            {/* Time Sheet */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Registro de Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <TimeSheet timeEntries={dailyData?.timeEntries || []} />
              </CardContent>
            </Card>
          </div>
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
