import React from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, FileText, Phone, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransaccionActivityTabProps {
  transaccion: Transaccion;
}

// Mock data - en implementación real esto vendría de la base de datos
const mockActivities = [
  {
    id: '1',
    type: 'creation',
    title: 'Transacción creada',
    description: 'Se creó la transacción en el sistema',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Sistema',
    icon: FileText
  },
  {
    id: '2',
    type: 'note',
    title: 'Nota añadida',
    description: 'Se añadió información adicional sobre el cliente',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Usuario',
    icon: MessageSquare
  }
];

export const TransaccionActivityTab = ({ transaccion }: TransaccionActivityTabProps) => {
  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      creation: 'bg-blue-100 text-blue-600',
      note: 'bg-green-100 text-green-600',
      email: 'bg-purple-100 text-purple-600',
      call: 'bg-orange-100 text-orange-600',
      meeting: 'bg-indigo-100 text-indigo-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Timeline de Actividad</h3>
      </div>

      {/* Activity Timeline */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {mockActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividad registrada</p>
              <p className="text-xs">Las actividades aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
              
              {mockActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex items-start gap-4 pb-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-background border border-border rounded-full">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 min-w-0 bg-neutral-0 border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground">
                              {activity.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getActivityColor(activity.type)}`}
                            >
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Por {activity.user}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(activity.timestamp), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};