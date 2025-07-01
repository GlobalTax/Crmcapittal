import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Calendar, Star, Clock, Target, Timer as TimerIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Timer } from '@/components/time-tracking/Timer';
import { DigitalClock } from '@/components/time-tracking/DigitalClock';
import { FloatingTimer } from '@/components/time-tracking/FloatingTimer';
import { TimeSheet } from '@/components/time-tracking/TimeSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';

const MyDay = () => {
  const today = new Date().toISOString().split('T')[0];
  const { dailyData, isLoading: isTimeLoading, error: timeTrackingError } = useTimeTracking(today);
  const { timeEntries, createTimeEntry, error: timeEntriesError } = useTimeEntries();
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Revisar propuestas de clientes',
      description: 'Analizar las 3 propuestas recibidas esta semana',
      priority: 'high',
      completed: false,
      estimatedTime: 60,
      category: 'work'
    },
    {
      id: '2',
      title: 'Llamada con equipo de desarrollo',
      description: 'Reunión semanal de seguimiento del proyecto',
      priority: 'medium',
      completed: true,
      estimatedTime: 30,
      category: 'meeting'
    },
    {
      id: '3',
      title: 'Preparar presentación Q4',
      description: 'Slides para la presentación de resultados del trimestre',
      priority: 'high',
      completed: false,
      estimatedTime: 120,
      category: 'work'
    }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleFloatingTimerSave = async (seconds: number) => {
    try {
      const minutes = Math.round(seconds / 60);
      await createTimeEntry({
        description: 'Tiempo registrado desde timer flotante',
        duration_minutes: minutes,
        is_billable: true
      });
      toast.success(`Tiempo guardado: ${minutes} minutos`);
    } catch (error) {
      console.error('Error saving floating timer:', error);
      toast.error('Error al guardar el tiempo');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return Target;
      case 'meeting': return Calendar;
      case 'personal': return Star;
      default: return Circle;
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTime = tasks.reduce((total, task) => total + task.estimatedTime, 0);
  const completedTime = tasks.filter(task => task.completed).reduce((total, task) => total + task.estimatedTime, 0);

  // Calculate time tracking stats using the correct timeEntries
  const todayTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.created_at).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const totalTrackedMinutes = todayTimeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
  const billableMinutes = todayTimeEntries.filter(entry => entry.is_billable).reduce((sum, entry) => sum + entry.duration_minutes, 0);

  // Show error state if there are persistent errors
  if ((timeTrackingError || timeEntriesError) && !isTimeLoading) {
    return (
      <ErrorBoundary>
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Día</h1>
              <p className="text-red-600">Error al cargar los datos. Recarga la página para intentar de nuevo.</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Recargar
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Page Header with Clock */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Día</h1>
            <p className="text-gray-600">Organiza y planifica tu jornada de trabajo</p>
          </div>
          <div className="flex gap-4 items-center">
            <DigitalClock />
            <Button 
              onClick={() => setShowFloatingTimer(!showFloatingTimer)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TimerIcon className="w-4 h-4" />
              {showFloatingTimer ? 'Ocultar' : 'Mostrar'} Timer
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="shadow-sm border border-gray-200/60 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200/60 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200/60 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Registrado</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(totalTrackedMinutes / 60)}h {totalTrackedMinutes % 60}m</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200/60 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Facturable</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(billableMinutes / 60)}h {billableMinutes % 60}m</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200/60 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progreso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border border-gray-200/60 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Tareas de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const CategoryIcon = getCategoryIcon(task.category);
                    
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                          task.completed 
                            ? 'bg-gray-50 border-l-gray-300' 
                            : 'bg-white border-l-blue-400 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {task.completed && <CheckCircle className="w-3 h-3" />}
                            </button>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className="w-4 h-4 text-gray-500" />
                                <h3 className={`font-medium ${
                                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </h3>
                              </div>
                              
                              {task.description && (
                                <p className={`text-sm mb-3 ${
                                  task.completed ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                </Badge>
                                
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Tracking Section */}
            {todayTimeEntries.length > 0 && (
              <Card className="shadow-sm border border-gray-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Registro de Tiempo - Hoy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSheet timeEntries={todayTimeEntries} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Timer Component */}
            <Timer />

            {/* Daily Summary */}
            <Card className="shadow-sm border border-gray-200/60 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progreso general</span>
                    <span className="font-semibold text-gray-900">
                      {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiempo registrado</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor(totalTrackedMinutes / 60)}h {totalTrackedMinutes % 60}m
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiempo facturable</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor(billableMinutes / 60)}h {billableMinutes % 60}m
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entradas de tiempo</span>
                    <span className="font-semibold text-gray-900">
                      {todayTimeEntries.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Timer */}
        {showFloatingTimer && (
          <FloatingTimer onSave={handleFloatingTimerSave} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MyDay;
