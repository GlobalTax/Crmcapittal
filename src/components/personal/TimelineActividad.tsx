import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Activity, CheckCircle, User, Briefcase, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineActividadProps {
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_completed':
      return CheckCircle;
    case 'lead_converted':
      return User;
    case 'deal_created':
      return Briefcase;
    case 'email_sent':
      return Mail;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'task_completed':
      return 'text-green-600';
    case 'lead_converted':
      return 'text-blue-600';
    case 'deal_created':
      return 'text-purple-600';
    case 'email_sent':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export const TimelineActividad = ({ className }: TimelineActividadProps) => {
  const { activities, loading } = useActivityFeed();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>No hay actividad reciente</p>
              <p className="text-xs">Las actividades aparecerán aquí</p>
            </div>
          ) : (
            activities.slice(0, 20).map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 ${colorClass.replace('text-', 'bg-')} rounded-full mt-2`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                  </div>
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};