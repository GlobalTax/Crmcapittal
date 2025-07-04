import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  User, 
  Target, 
  Play, 
  Pause,
  Bell,
  Activity,
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { CreateTaskForm } from "@/components/personal/CreateTaskForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimeEntry {
  id: string;
  task: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  project?: string;
  description?: string;
}

export const PersonalDashboard = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Obtener leads asignados al usuario
  const { leads } = useLeads({ assigned_to_id: user?.id });
  
  // Obtener tareas del usuario
  const { 
    tasks, 
    loading: tasksLoading, 
    createTask, 
    completeTask, 
    getTodayTasks, 
    getCompletedTasks, 
    getUrgentTasks 
  } = usePersonalTasks();

  // Simular datos de time tracking
  useEffect(() => {
    const mockTimeEntries: TimeEntry[] = [
      {
        id: '1',
        task: 'Análisis de leads',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        project: 'Lead Management',
        description: 'Revisión y clasificación de leads nuevos'
      },
      {
        id: '2',
        task: 'Llamadas de seguimiento',
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        project: 'Sales',
        description: 'Contacto con leads calificados'
      }
    ];
    setTimeEntries(mockTimeEntries);
  }, []);

  const handleStartTimer = (taskTitle: string) => {
    setIsTimerRunning(true);
    setCurrentTask(taskTitle);
    // Aquí se integraría con el sistema de time tracking
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setCurrentTask('');
    // Guardar entrada de tiempo
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleAddTask = async (taskData: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'lead' | 'meeting' | 'follow-up' | 'admin';
    due_date: string;
  }) => {
    const result = await createTask({
      ...taskData,
      completed: false
    });
    if (result) {
      setShowCreateTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead': return <User className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'follow-up': return <Bell className="h-4 w-4" />;
      case 'admin': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const todayTasks = getTodayTasks();
  const completedTasks = getCompletedTasks();
  const totalWorkTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {completedTasks.length} completadas hoy
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transform transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayTasks.filter(t => t.priority === 'urgent').length} urgentes
            </p>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Trabajado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalWorkTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(totalWorkTime % 60)}m hoy
            </p>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Asignados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === 'NEW').length} nuevos
            </p>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tareas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tareas del Día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tareas del Día
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Task */}
            <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tarea</DialogTitle>
                </DialogHeader>
                <CreateTaskForm
                  onSubmit={handleAddTask}
                  onCancel={() => setShowCreateTask(false)}
                  loading={tasksLoading}
                />
              </DialogContent>
            </Dialog>

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Cargando tareas...</p>
                </div>
              ) : todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCompleteTask(task.id)}
                    className="mt-0.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(task.category)}
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.due_date), 'HH:mm')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartTimer(task.title)}
                        disabled={isTimerRunning}
                        className="h-6 px-2 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Timer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {!tasksLoading && todayTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>¡No hay tareas pendientes!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking & Leads */}
        <div className="space-y-6">
          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTimerRunning ? (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-primary mb-2">
                    ⏱️ Timer Activo
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{currentTask}</p>
                  <Button onClick={handleStopTimer} variant="destructive">
                    <Pause className="h-4 w-4 mr-2" />
                    Detener Timer
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-muted-foreground mb-2">
                    ⏸️ Timer Inactivo
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inicia un timer desde una tarea
                  </p>
                </div>
              )}

              {/* Recent Time Entries */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Entradas Recientes</h4>
                <div className="space-y-2">
                  {timeEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center text-sm">
                      <span className="truncate">{entry.task}</span>
                      <span className="text-muted-foreground">{entry.duration}min</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Asignados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Leads Asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.company_name || 'Sin empresa'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lead.status}
                    </Badge>
                  </div>
                ))}
                
                {leads.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2" />
                    <p>No tienes leads asignados</p>
                  </div>
                )}
              </div>
              
              {leads.length > 5 && (
                <Button variant="outline" className="w-full mt-3">
                  Ver todos ({leads.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tarea completada: Llamar a Juan Pérez</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Lead convertido: María García</p>
                <p className="text-xs text-muted-foreground">Hace 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Timer iniciado: Análisis de leads</p>
                <p className="text-xs text-muted-foreground">Hace 6 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDashboard;