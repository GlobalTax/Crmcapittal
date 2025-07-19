import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Video, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgendaItem {
  id: string;
  title: string;
  time: Date;
  type: 'meeting' | 'call' | 'video' | 'task';
  participants?: string[];
  description?: string;
}

interface AgendaPanelProps {
  className?: string;
}

const mockAgendaItems: AgendaItem[] = [
  {
    id: '1',
    title: 'Reunión con Inversiones XYZ',
    time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    type: 'meeting',
    participants: ['Carlos Ruiz', 'Ana García'],
    description: 'Presentación de propuesta M&A'
  },
  {
    id: '2',
    title: 'Llamada de seguimiento - Tech Solutions',
    time: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    type: 'call',
    participants: ['María González']
  },
  {
    id: '3',
    title: 'Video conferencia con equipo',
    time: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    type: 'video',
    participants: ['Todo el equipo']
  },
  {
    id: '4',
    title: 'Revisar documentos de transacción',
    time: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    type: 'task'
  }
];

const getItemIcon = (type: AgendaItem['type']) => {
  switch (type) {
    case 'meeting':
      return Users;
    case 'call':
      return Phone;
    case 'video':
      return Video;
    case 'task':
      return Clock;
    default:
      return Calendar;
  }
};

const getItemColor = (type: AgendaItem['type']) => {
  switch (type) {
    case 'meeting':
      return 'text-primary bg-primary/10';
    case 'call':
      return 'text-success bg-success/10';
    case 'video':
      return 'text-warning bg-warning/10';
    case 'task':
      return 'text-info bg-info/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export const AgendaPanel: React.FC<AgendaPanelProps> = ({ className }) => {
  const today = new Date();
  
  return (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Agenda de Hoy</h3>
          <p className="text-sm text-muted-foreground">
            {format(today, 'EEEE, d MMMM', { locale: es })}
          </p>
        </div>
        <Button variant="outline" size="sm">
          Ver calendario
        </Button>
      </div>
      
      <div className="space-y-4">
        {mockAgendaItems.map((item) => {
          const Icon = getItemIcon(item.type);
          const colorClass = getItemColor(item.type);
          
          return (
            <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                colorClass
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-card-foreground">
                    {item.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {format(item.time, 'HH:mm')}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
                
                {item.participants && (
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.participants.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};