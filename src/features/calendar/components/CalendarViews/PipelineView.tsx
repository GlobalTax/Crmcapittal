import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { CalendarViewProps, CalendarEvent, PipelineGroup } from '../../types';
import { cn } from '@/lib/utils';

export function PipelineView({ 
  events, 
  selectedDate, 
  onEventClick, 
  onEventCreate, 
  loading 
}: CalendarViewProps) {
  
  const groupEventsByPipeline = (): Record<string, PipelineGroup> => {
    const groups: Record<string, PipelineGroup> = {};

    events.forEach(event => {
      let groupKey = 'general';
      let groupType: 'deal' | 'contact' | 'company' = 'deal';
      let groupTitle = 'Eventos Generales';
      let groupSubtitle = 'Sin categoría específica';

      // Determinar tipo de grupo basado en las relaciones del evento
      if (event.deal_id) {
        groupKey = `deal-${event.deal_id}`;
        groupType = 'deal';
        groupTitle = `Deal: ${event.title.split(' - ')[1] || 'Deal sin nombre'}`;
        groupSubtitle = 'Pipeline de ventas';
      } else if (event.contact_id) {
        groupKey = `contact-${event.contact_id}`;
        groupType = 'contact';
        groupTitle = `Contacto: ${event.title.split(' - ')[1] || 'Contacto sin nombre'}`;
        groupSubtitle = 'Relación comercial';
      } else if (event.company_id) {
        groupKey = `company-${event.company_id}`;
        groupType = 'company';
        groupTitle = `Empresa: ${event.title.split(' - ')[1] || 'Empresa sin nombre'}`;
        groupSubtitle = 'Cuenta empresarial';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          title: groupTitle,
          subtitle: groupSubtitle,
          type: groupType,
          events: [],
          totalEvents: 0,
          nextEvent: null
        };
      }

      groups[groupKey].events.push(event);
    });

    // Procesar cada grupo
    Object.keys(groups).forEach(key => {
      const group = groups[key];
      group.totalEvents = group.events.length;
      
      // Ordenar eventos por fecha
      group.events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      
      // Encontrar próximo evento
      const now = new Date();
      group.nextEvent = group.events.find(event => new Date(event.start_date) > now) || null;
    });

    return groups;
  };

  const getTypeIcon = (type: 'deal' | 'contact' | 'company') => {
    switch (type) {
      case 'deal': return <Briefcase className="h-5 w-5" />;
      case 'contact': return <User className="h-5 w-5" />;
      case 'company': return <Building2 className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: 'deal' | 'contact' | 'company') => {
    switch (type) {
      case 'deal': return 'text-green-600 bg-green-100';
      case 'contact': return 'text-blue-600 bg-blue-100';
      case 'company': return 'text-purple-600 bg-purple-100';
    }
  };

  const getEventTypeColor = (event: CalendarEvent): string => {
    switch (event.meeting_type) {
      case 'demo': return 'border-l-blue-500';
      case 'follow_up': return 'border-l-green-500';
      case 'closing': return 'border-l-purple-500';
      case 'negotiation': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const getPipelineStage = (meetingType?: string): string => {
    switch (meetingType) {
      case 'demo': return 'Demostración';
      case 'follow_up': return 'Seguimiento';
      case 'closing': return 'Cierre';
      case 'negotiation': return 'Negociación';
      default: return 'General';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const pipelineGroups = groupEventsByPipeline();
  const groupsArray = Object.values(pipelineGroups);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Vista Pipeline - {format(selectedDate, 'd MMMM yyyy', { locale: es })}
          </h2>
          <p className="text-sm text-muted-foreground">
            Eventos organizados por deals, contactos y empresas
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {groupsArray.length} pipelines activos
        </div>
      </div>

      {/* Pipeline Groups */}
      <div className="space-y-6">
        {groupsArray.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay eventos en el pipeline</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando eventos vinculados a deals, contactos o empresas
              </p>
              <button
                onClick={() => onEventCreate?.(selectedDate)}
                className="text-primary hover:underline"
              >
                + Crear primer evento
              </button>
            </CardContent>
          </Card>
        ) : (
          groupsArray.map(group => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      getTypeColor(group.type)
                    )}>
                      {getTypeIcon(group.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {group.totalEvents} eventos
                    </Badge>
                    {group.nextEvent && (
                      <Badge variant="outline" className="text-green-600">
                        Próximo: {format(new Date(group.nextEvent.start_date), 'd MMM HH:mm', { locale: es })}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {group.events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Línea de conexión */}
                      {index < group.events.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-8 bg-border"></div>
                      )}

                      <div 
                        className={cn(
                          "flex items-start gap-4 p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors",
                          getEventTypeColor(event)
                        )}
                        onClick={() => onEventClick?.(event)}
                      >
                        {/* Timeline dot */}
                        <div className="relative">
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2 border-white mt-2",
                            event.meeting_type === 'demo' && "bg-blue-500",
                            event.meeting_type === 'follow_up' && "bg-green-500",
                            event.meeting_type === 'closing' && "bg-purple-500",
                            event.meeting_type === 'negotiation' && "bg-orange-500",
                            !event.meeting_type && "bg-gray-500"
                          )}></div>
                        </div>

                        {/* Event content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-base mb-1">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(new Date(event.start_date), 'd MMM yyyy HH:mm', { locale: es })}
                                </span>
                                <ChevronRight className="h-4 w-4" />
                                <span>
                                  {format(new Date(event.end_date), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {getPipelineStage(event.meeting_type)}
                            </Badge>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {event.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">
                                Alta prioridad
                              </Badge>
                            )}
                            {event.status === 'confirmed' && (
                              <Badge variant="default" className="text-xs">
                                Confirmado
                              </Badge>
                            )}
                            {event.follow_up_required && (
                              <Badge variant="outline" className="text-xs">
                                Requiere seguimiento
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add event to pipeline */}
                  <div className="border-t pt-3 mt-4">
                    <button
                      onClick={() => onEventCreate?.(selectedDate)}
                      className="w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      + Agregar evento a este pipeline
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {groupsArray.filter(g => g.type === 'deal').length}
              </div>
              <div className="text-sm text-muted-foreground">Deals Activos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {groupsArray.filter(g => g.type === 'contact').length}
              </div>
              <div className="text-sm text-muted-foreground">Contactos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {groupsArray.filter(g => g.type === 'company').length}
              </div>
              <div className="text-sm text-muted-foreground">Empresas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}