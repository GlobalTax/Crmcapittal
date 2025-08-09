import React, { useState } from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateTasksTabProps {
  mandate: BuyingMandate;
}

export const MandateTasksTab = ({ mandate }: MandateTasksTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  // Mock tasks data
  const mockTasks = [
    {
      id: '1',
      title: 'Enviar información inicial al cliente',
      description: 'Preparar y enviar el resumen de empresas identificadas',
      assignee: 'María López',
      due_date: '2024-01-25',
      priority: 'alta',
      status: 'pending',
      category: 'comunicacion'
    },
    {
      id: '2',
      title: 'Contactar con Tech Solutions S.L.',
      description: 'Primera toma de contacto telefónico',
      assignee: 'Juan García',
      due_date: '2024-01-22',
      priority: 'media',
      status: 'completed',
      category: 'prospecting',
      completed_at: '2024-01-20'
    },
    {
      id: '3',
      title: 'Revisar documentación financiera',
      description: 'Análisis de estados financieros de empresas objetivo',
      assignee: 'Ana Martín',
      due_date: '2024-01-20',
      priority: 'urgente',
      status: 'overdue',
      category: 'analisis'
    },
    {
      id: '4',
      title: 'Programar reunión con Industrial Partners',
      description: 'Coordinar calendario para reunión presencial',
      assignee: 'Carlos Ruiz',
      due_date: '2024-01-28',
      priority: 'media',
      status: 'pending',
      category: 'reunion'
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'baja': 'bg-gray-100 text-gray-600',
      'media': 'bg-blue-100 text-blue-600',
      'alta': 'bg-orange-100 text-orange-600',
      'urgente': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-600',
      'completed': 'bg-green-100 text-green-600',
      'overdue': 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'overdue': 'Vencida'
    };
    return labels[status] || status;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comunicacion': return '✉️';
      case 'prospecting': return '📞';
      case 'analisis': return '📊';
      case 'reunion': return '🤝';
      default: return '📋';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'pending') matchesFilter = task.status === 'pending';
    if (filter === 'completed') matchesFilter = task.status === 'completed';
    if (filter === 'overdue') matchesFilter = isOverdue(task.due_date, task.status);
    
    return matchesSearch && matchesFilter;
  });

  const taskCounts = {
    all: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    overdue: mockTasks.filter(t => isOverdue(t.due_date, t.status)).length
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header + Filtros */}
      <div className="space-y-4">
        {/* Header and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Tareas del Mandato</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona las tareas y seguimiento del mandato
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({taskCounts.all})
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pendientes ({taskCounts.pending})
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completadas ({taskCounts.completed})
            </Button>
            {taskCounts.overdue > 0 && (
              <Button 
                variant={filter === 'overdue' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('overdue')}
                className="text-red-600 border-red-200"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Vencidas ({taskCounts.overdue})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox 
                    checked={task.status === 'completed'}
                    className="mt-1"
                  />
                  
                  {/* Category Icon */}
                  <div className="text-xl mt-0.5">
                    {getCategoryIcon(task.category)}
                  </div>
                  
                  {/* Task Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                      
                      {/* Status and Priority Badges */}
                      <div className="flex gap-2">
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Task Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignee}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isOverdue(task.due_date, task.status) && task.status !== 'completed' && (
                            <span className="text-red-500 mr-1">⚠️</span>
                          )}
                          {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                      
                      {task.completed_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Completada el {format(new Date(task.completed_at), 'dd MMM', { locale: es })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? "No se encontraron tareas con esos criterios" 
                : "Crea tareas para organizar el trabajo del mandato"
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Tarea
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};