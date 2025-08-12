import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer } from '@/components/time-tracking/Timer';
import { SmartTimer } from '@/components/time-tracking/SmartTimer';
import { EnhancedDashboard } from '@/components/time-tracking/EnhancedDashboard';
import { ProductivityDashboard } from '@/components/time-tracking/ProductivityDashboard';
import { TeamTimeTracking } from '@/components/time-tracking/TeamTimeTracking';
import { EnhancedTimeSheet } from '@/components/time-tracking/EnhancedTimeSheet';
import { TimeTrackingStats } from '@/components/time-tracking/TimeTrackingStats';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Calendar, BarChart3, List, Timer as TimerIcon, Users, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { TimeEntry } from '@/types/TimeTracking';

export default function MinimalTimeTracking() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timer');
  const { 
    timeEntries, 
    selectedDate, 
    setSelectedDate, 
    createTimeEntry, 
    deleteTimeEntry,
    isLoading,
    isCreating
  } = useTimeEntries();

  const handleDuplicateEntry = (entry: TimeEntry) => {
    if (!entry.description || !entry.activity_type) {
      toast.error('Entrada incompleta para duplicar');
      return;
    }

    const duplicatedEntry = {
      activity_type: entry.activity_type,
      description: entry.description,
      start_time: new Date().toISOString(),
      is_billable: entry.is_billable || false,
      contact_id: entry.contact_id,
      operation_id: entry.operation_id,
      lead_id: entry.lead_id,
      mandate_id: entry.mandate_id
    };

    createTimeEntry(duplicatedEntry);
    toast.success('Entrada duplicada y iniciada');
  };

  const handleContinueTask = (entry: TimeEntry) => {
    handleDuplicateEntry(entry);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    // TODO: Implement edit functionality
    toast.info('Función de edición próximamente disponible');
  };

  // Calculate today's data for the enhanced dashboard
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    return entryDate === today;
  });

  const dailyData = {
    plannedTasks: [], // TODO: Integrate with planned tasks
    timeEntries: todayEntries,
    activeTimer: todayEntries.find(entry => !entry.end_time)
  };

  const isTimerRunning = !!dailyData.activeTimer;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {todayEntries.length} entradas hoy
          </div>
          {isTimerRunning && (
            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Timer activo
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <TimeTrackingStats timeEntries={todayEntries} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <TimerIcon className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Smart
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Panel
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Timer />
            </div>
            <div className="lg:col-span-1">
              <EnhancedDashboard 
                dailyData={dailyData}
                isTimerRunning={isTimerRunning}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smart">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SmartTimer />
            </div>
            <div className="lg:col-span-1">
              <ProductivityDashboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="grid gap-6">
            <ProductivityDashboard />
          </div>
        </TabsContent>

        <TabsContent value="team">
          <TeamTimeTracking />
        </TabsContent>

        <TabsContent value="entries">
          <EnhancedTimeSheet
            timeEntries={timeEntries as any}
            onDuplicateEntry={handleDuplicateEntry}
            onContinueTask={handleContinueTask}
            onEditEntry={handleEditEntry}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análisis de Productividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Tiempo Total Esta Semana</h4>
                    <p className="text-2xl font-bold text-primary">
                      {Math.floor(todayEntries.reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) / 60)}h {todayEntries.reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) % 60}m
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Tiempo Facturable</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor(todayEntries.filter(e => e.is_billable).reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) / 60)}h {todayEntries.filter(e => e.is_billable).reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) % 60}m
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Actividades Únicas</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Set(todayEntries.map(e => e.activity_type)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}