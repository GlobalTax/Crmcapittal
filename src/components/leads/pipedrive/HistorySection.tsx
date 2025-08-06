
import { useState } from 'react';
import { Filter, Clock, User, Building2, Tag, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lead } from '@/types/Lead';
import { useLeadActivities } from '@/hooks/leads/useLeadActivities';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorySectionProps {
  lead: Lead;
}

export const HistorySection = ({ lead }: HistorySectionProps) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { activities, isLoading } = useLeadActivities(lead.id);

  // Helper functions defined before use
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL_MADE':
        return Phone;
      case 'EMAIL_SENT':
      case 'EMAIL_OPENED':
      case 'EMAIL_CLICKED':
        return Mail;
      case 'MEETING_SCHEDULED':
        return Calendar;
      case 'FORM_SUBMITTED':
        return FileText;
      case 'STAGE_CHANGED':
        return Building2;
      default:
        return Clock;
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'CALL_MADE':
        return 'Llamada realizada';
      case 'EMAIL_SENT':
        return 'Email enviado';
      case 'EMAIL_OPENED':
        return 'Email abierto';
      case 'EMAIL_CLICKED':
        return 'Email clickeado';
      case 'MEETING_SCHEDULED':
        return 'Reunión programada';
      case 'FORM_SUBMITTED':
        return 'Formulario enviado';
      case 'STAGE_CHANGED':
        return 'Etapa cambiada';
      case 'WEBSITE_VISIT':
        return 'Visita al sitio web';
      case 'DOCUMENT_DOWNLOADED':
        return 'Documento descargado';
      default:
        return 'Actividad registrada';
    }
  };

  // Combine activities with system events
  const historyEntries = [
    {
      id: 'created',
      type: 'created',
      title: 'Lead creado',
      description: `Lead "${lead.name}" fue creado`,
      date: lead.created_at,
      user: 'Sistema',
      icon: Tag
    },
    ...activities.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      title: getActivityTitle(activity.activity_type),
      description: `Actividad de tipo ${activity.activity_type.replace('_', ' ').toLowerCase()}`,
      date: activity.created_at,
      user: 'Usuario',
      icon: getActivityIcon(activity.activity_type)
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEntries = historyEntries.filter(entry => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'activities') return ['CALL_MADE', 'EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'MEETING_SCHEDULED', 'FORM_SUBMITTED'].includes(entry.type);
    if (activeFilter === 'changes') return ['created', 'STAGE_CHANGED'].includes(entry.type);
    if (activeFilter === 'emails') return ['EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED'].includes(entry.type);
    return true;
  });

  const filters = [
    { id: 'all', label: 'Todo', count: historyEntries.length },
    { id: 'activities', label: 'Actividades', count: activities.length },
    { id: 'changes', label: 'Cambios', count: 1 },
    { id: 'emails', label: 'Emails', count: activities.filter(a => ['EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED'].includes(a.activity_type)).length }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historia del Lead
          </CardTitle>
          <Badge variant="secondary">{filteredEntries.length} entradas</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* History Timeline */}
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
              <p>Cargando historial...</p>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
                const IconComponent = entry.icon;
                const isLast = index === filteredEntries.length - 1;
                
                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-5 top-10 w-0.5 h-8 bg-border" />
                    )}
                    
                    <div className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{entry.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {entry.description}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(new Date(entry.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{entry.user}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No hay entradas en el historial</p>
              <p className="text-sm">Las actividades aparecerán aquí cuando se registren</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
