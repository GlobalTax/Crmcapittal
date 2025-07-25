import React, { useState } from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Calendar, MessageSquare, Phone, Mail, FileText, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateActivityTabProps {
  mandate: BuyingMandate;
}

export const MandateActivityTab = ({ mandate }: MandateActivityTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'communication' | 'documents' | 'tasks' | 'system'>('all');

  // Mock activity data
  const mockActivities = [
    {
      id: '1',
      type: 'communication',
      title: 'Llamada telefónica con Tech Solutions S.L.',
      description: 'Primera toma de contacto. Muy receptivos al mandato.',
      user: 'Juan García',
      timestamp: '2024-01-22T10:30:00Z',
      details: {
        contact: 'María García',
        company: 'Tech Solutions S.L.',
        duration: '45 minutos'
      }
    },
    {
      id: '2',
      type: 'document',
      title: 'Documento subido: Análisis Sectorial',
      description: 'Análisis completo del sector tecnológico',
      user: 'Ana Martín',
      timestamp: '2024-01-21T14:15:00Z',
      details: {
        document: 'Análisis Sectorial - Tecnología.pdf',
        size: '4.2 MB'
      }
    },
    {
      id: '3',
      type: 'task',
      title: 'Tarea completada: Investigación de mercado',
      description: 'Finalizada la investigación inicial del sector',
      user: 'Carlos Ruiz',
      timestamp: '2024-01-20T16:45:00Z',
      details: {
        task: 'Investigación sectorial',
        status: 'completed'
      }
    },
    {
      id: '4',
      type: 'communication',
      title: 'Email enviado a Industrial Partners',
      description: 'Información inicial y solicitud de reunión',
      user: 'María López',
      timestamp: '2024-01-19T09:20:00Z',
      details: {
        contact: 'Juan Martínez',
        company: 'Industrial Partners',
        subject: 'Oportunidad de inversión'
      }
    },
    {
      id: '5',
      type: 'system',
      title: 'Mandato actualizado',
      description: 'Criterios de facturación modificados',
      user: 'Sistema',
      timestamp: '2024-01-18T11:30:00Z',
      details: {
        field: 'min_revenue',
        old_value: '2000000',
        new_value: '2500000'
      }
    },
    {
      id: '6',
      type: 'communication',
      title: 'Reunión con cliente',
      description: 'Revisión de avances y próximos pasos',
      user: 'Ana Martín',
      timestamp: '2024-01-17T15:00:00Z',
      details: {
        meeting_type: 'presencial',
        duration: '90 minutos',
        attendees: 3
      }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'communication':
        return MessageSquare;
      case 'document':
        return FileText;
      case 'task':
        return Calendar;
      case 'system':
        return Building2;
      default:
        return MessageSquare;
    }
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'communication': 'bg-blue-100 text-blue-600',
      'document': 'bg-green-100 text-green-600',
      'task': 'bg-orange-100 text-orange-600',
      'system': 'bg-gray-100 text-gray-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'communication': 'Comunicación',
      'document': 'Documento',
      'task': 'Tarea',
      'system': 'Sistema'
    };
    return labels[type] || type;
  };

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter !== 'all') {
      matchesFilter = activity.type === filter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const activityCounts = {
    all: mockActivities.length,
    communication: mockActivities.filter(a => a.type === 'communication').length,
    documents: mockActivities.filter(a => a.type === 'document').length,
    tasks: mockActivities.filter(a => a.type === 'task').length,
    system: mockActivities.filter(a => a.type === 'system').length
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Actividad del Mandato</h2>
          <p className="text-sm text-muted-foreground">
            Historial completo de todas las actividades
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Actividad
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en actividades..."
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
            Todas ({activityCounts.all})
          </Button>
          <Button 
            variant={filter === 'communication' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('communication')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Comunicación ({activityCounts.communication})
          </Button>
          <Button 
            variant={filter === 'documents' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('documents')}
          >
            <FileText className="h-3 w-3 mr-1" />
            Documentos ({activityCounts.documents})
          </Button>
          <Button 
            variant={filter === 'tasks' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('tasks')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Tareas ({activityCounts.tasks})
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          
          return (
            <Card key={activity.id} className="relative">
              {/* Timeline connector */}
              {index < filteredActivities.length - 1 && (
                <div className="absolute left-8 top-16 w-px h-8 bg-border" />
              )}
              
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                    </div>
                    
                    {/* Activity Details */}
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">
                              {key.replace('_', ' ')}:
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Activity Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-muted">
                            {activity.user.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.user}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(activity.timestamp), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay actividades</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm 
              ? "No se encontraron actividades con esos criterios" 
              : "Las actividades aparecerán aquí mientras trabajas en el mandato"
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Primera Actividad
          </Button>
        </div>
      )}
    </div>
  );
};