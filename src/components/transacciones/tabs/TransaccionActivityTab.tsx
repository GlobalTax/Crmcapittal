import React from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, FileText, Phone, Mail, Calendar, TrendingUp, CheckCircle, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransaccionActivities } from '@/hooks/useTransaccionActivities';

interface TransaccionActivityTabProps {
  transaccion: Transaccion;
}

export const TransaccionActivityTab = ({ transaccion }: TransaccionActivityTabProps) => {
  const { activities, loading, error } = useTransaccionActivities(transaccion.id);

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      created: 'bg-blue-100 text-blue-600',
      updated: 'bg-yellow-100 text-yellow-600', 
      stage_changed: 'bg-purple-100 text-purple-600',
      note_added: 'bg-green-100 text-green-600',
      task_created: 'bg-indigo-100 text-indigo-600',
      task_completed: 'bg-green-100 text-green-600',
      document_uploaded: 'bg-orange-100 text-orange-600',
      contact_interaction: 'bg-pink-100 text-pink-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      created: FileText,
      updated: TrendingUp,
      stage_changed: TrendingUp,
      note_added: MessageSquare,
      task_created: Calendar,
      task_completed: CheckCircle,
      document_uploaded: Upload,
      contact_interaction: Phone
    };
    return icons[type] || MessageSquare;
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando actividades...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Error al cargar las actividades: {error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividad registrada</p>
              <p className="text-xs">Las actividades aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
              
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.activity_type);
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
                              className={`text-xs ${getActivityColor(activity.activity_type)}`}
                            >
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Por sistema</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(activity.created_at), { 
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