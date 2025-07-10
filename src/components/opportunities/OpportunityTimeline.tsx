import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, FileText, Users, TrendingUp } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpportunityTimelineProps {
  opportunityId: string;
}

// Mock data - esto vendría de la base de datos
const mockActivities = [
  {
    id: '1',
    type: 'meeting',
    title: 'Reunión de descubrimiento programada',
    description: 'Reunión con el equipo directivo para entender necesidades',
    date: new Date().toISOString(),
    user: 'Ana García',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: '2',
    type: 'email',
    title: 'Email enviado con propuesta inicial',
    description: 'Propuesta técnica y comercial enviada al decisor principal',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    user: 'Carlos López',
    icon: Mail,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: '3',
    type: 'call',
    title: 'Llamada de seguimiento',
    description: 'Conversación telefónica para resolver dudas técnicas',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user: 'María Rodríguez',
    icon: Phone,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: '4',
    type: 'stage_change',
    title: 'Oportunidad movida a Cualificación',
    description: 'Estado actualizado tras confirmar fit comercial',
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    user: 'Sistema',
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: '5',
    type: 'note',
    title: 'Nota añadida',
    description: 'El cliente mostró interés especial en la integración con su ERP actual',
    date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    user: 'Ana García',
    icon: FileText,
    color: 'bg-gray-100 text-gray-800'
  }
];

export const OpportunityTimeline = ({ opportunityId }: OpportunityTimelineProps) => {
  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Hoy, ${format(date, 'HH:mm', { locale: es })}`;
    } else if (isYesterday(date)) {
      return `Ayer, ${format(date, 'HH:mm', { locale: es })}`;
    } else {
      return format(date, 'dd MMM yyyy, HH:mm', { locale: es });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Línea de tiempo de actividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
          
          <div className="space-y-6">
            {mockActivities.map((activity, index) => {
              const Icon = activity.icon;
              
              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Icono */}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-border">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{activity.title}</h4>
                          <Badge variant="secondary" className={activity.color}>
                            {activity.type === 'meeting' && 'Reunión'}
                            {activity.type === 'email' && 'Email'}
                            {activity.type === 'call' && 'Llamada'}
                            {activity.type === 'stage_change' && 'Cambio etapa'}
                            {activity.type === 'note' && 'Nota'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatActivityDate(activity.date)}</span>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {mockActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividades registradas aún</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};