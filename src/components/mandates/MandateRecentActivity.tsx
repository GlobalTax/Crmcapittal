
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'contact' | 'document' | 'status_change' | 'note' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: 'success' | 'pending' | 'warning';
}

interface MandateRecentActivityProps {
  activities?: ActivityItem[];
}

export const MandateRecentActivity = ({ activities = [] }: MandateRecentActivityProps) => {
  // Mock data para demostración
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'contact',
      title: 'Contacto telefónico realizado',
      description: 'Llamada a Empresa ABC - Interés confirmado',
      timestamp: '2024-01-20T10:30:00Z',
      user: 'Juan Pérez',
      status: 'success'
    },
    {
      id: '2',
      type: 'document',
      title: 'NDA enviado',
      description: 'Documento de confidencialidad enviado a Target XYZ',
      timestamp: '2024-01-19T15:45:00Z',
      user: 'María García',
      status: 'pending'
    },
    {
      id: '3',
      type: 'status_change',
      title: 'Target actualizado',
      description: 'Empresa DEF movida a "En Análisis"',
      timestamp: '2024-01-19T09:15:00Z',
      user: 'Carlos López',
      status: 'success'
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Reunión programada',
      description: 'Videoconferencia con Target ABC para el 25/01',
      timestamp: '2024-01-18T16:20:00Z',
      user: 'Ana Martín',
      status: 'warning'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'contact':
        return <Phone className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {activity.user}
                  </div>
                  {activity.status && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs h-5 ${
                        activity.status === 'success' ? 'border-green-200 text-green-700' :
                        activity.status === 'warning' ? 'border-orange-200 text-orange-700' :
                        'border-blue-200 text-blue-700'
                      }`}
                    >
                      {activity.status === 'success' ? 'Completado' :
                       activity.status === 'warning' ? 'Pendiente' :
                       'En proceso'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad reciente</p>
            <p className="text-sm">Las actividades aparecerán aquí cuando se realicen acciones en el mandato</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
