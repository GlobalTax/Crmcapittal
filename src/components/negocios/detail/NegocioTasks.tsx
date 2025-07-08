import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Plus, Calendar, User, Clock } from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NegocioTasksProps {
  negocio: Negocio;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  createdDate: string;
  completedDate?: string;
}

const priorities = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

// Mock data - in real implementation, this would come from a database
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Preparar NDA para cliente',
    description: 'Generar y enviar acuerdo de confidencialidad',
    priority: 'alta',
    status: 'pending',
    assignedTo: 'Juan Pérez',
    dueDate: '2024-01-20',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Revisar documentación financiera',
    description: 'Validar estados financieros de los últimos 3 años',
    priority: 'media',
    status: 'in_progress',
    assignedTo: 'María García',
    dueDate: '2024-01-25',
    createdDate: '2024-01-14'
  },
  {
    id: '3',
    title: 'Programar reunión inicial',
    description: 'Coordinar primera reunión con los propietarios',
    priority: 'urgente',
    status: 'completed',
    assignedTo: 'Carlos López',
    dueDate: '2024-01-16',
    createdDate: '2024-01-12',
    completedDate: '2024-01-16'
  }
];

export const NegocioTasks = ({ negocio }: NegocioTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignedTo: '',
    dueDate: ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return 'bg-gray-100 text-gray-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  const handleCreateTask = () => {
    if (taskForm.title) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority as Task['priority'],
        status: 'pending',
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate,
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setTasks([...tasks, newTask]);
      setTaskForm({
        title: '',
        description: '',
        priority: 'media',
        assignedTo: '',
        dueDate: ''
      });
      setShowCreateDialog(false);
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in_progress' : 'completed';
        return {
          ...task,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return task;
    }));
  };

  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tareas del Negocio
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título de la Tarea</Label>
                  <Input
                    id="task-title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Título de la tarea"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Descripción</Label>
                  <Textarea
                    id="task-description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Descripción de la tarea"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-priority">Prioridad</Label>
                    <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-due-date">Fecha Límite</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-assigned">Asignado a</Label>
                  <Input
                    id="task-assigned"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    placeholder="Nombre del responsable"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTask} disabled={!taskForm.title}>
                    Crear Tarea
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div>
            <h3 className="text-lg font-medium mb-4">Tareas Pendientes ({pendingTasks.length})</h3>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {task.assignedTo && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {task.assignedTo}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.dueDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay tareas pendientes
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Tareas Completadas ({completedTasks.length})</h3>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50 opacity-75">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium line-through">{task.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-through">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {task.assignedTo && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {task.assignedTo}
                          </div>
                        )}
                        {task.completedDate && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Completada: {task.completedDate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );};
