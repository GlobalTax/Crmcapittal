import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, MessageSquare, Building2, Phone, Mail, CheckCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'target_created' | 'target_contacted' | 'status_changed' | 'document_uploaded' | 'comment_added';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface MandateActivityTimelineProps {
  mandateId: string;
}

export const MandatoActivityLog = ({ mandateId }: MandateActivityTimelineProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - in real implementation, fetch from API
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'target_created',
        title: 'Nuevo target añadido',
        description: 'Se añadió Empresa ABC S.L. al mandato',
        user: 'Juan Pérez',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          company_name: 'Empresa ABC S.L.',
          sector: 'Tecnología'
        }
      },
      {
        id: '2',
        type: 'target_contacted',
        title: 'Primer contacto realizado',
        description: 'Se estableció contacto con Empresa ABC S.L. vía email',
        user: 'María García',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: {
          contact_method: 'email',
          company_name: 'Empresa ABC S.L.'
        }
      },
      {
        id: '3',
        type: 'status_changed',
        title: 'Estado actualizado',
        description: 'Empresa XYZ cambió de "Contactado" a "Interesado"',
        user: 'Ana López',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: {
          previous_status: 'contacted',
          new_status: 'interested',
          company_name: 'Empresa XYZ'
        }
      },
      {
        id: '4',
        type: 'document_uploaded',
        title: 'Documento subido',
        description: 'Se subió el NDA firmado de Empresa DEF',
        user: 'Carlos Ruiz',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        metadata: {
          document_type: 'nda',
          company_name: 'Empresa DEF'
        }
      },
      {
        id: '5',
        type: 'comment_added',
        title: 'Comentario añadido',
        description: 'Reunión programada para la próxima semana con el CEO',
        user: 'Laura Sánchez',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        metadata: {
          comment_type: 'follow_up'
        }
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 500);
  }, [mandateId]);

  const getActivityIcon = (type: Activity['type']) => {
    const iconConfig = {
      target_created: { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
      target_contacted: { icon: Phone, color: 'text-green-600', bg: 'bg-green-100' },
      status_changed: { icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
      document_uploaded: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
      comment_added: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    };

    return iconConfig[type] || iconConfig.comment_added;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return time.toLocaleDateString('es-ES');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Historial de acciones realizadas en este mandato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Historial de acciones realizadas en este mandato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const iconConfig = getActivityIcon(activity.type);
            const Icon = iconConfig.icon;
            
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconConfig.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${iconConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  
                  {/* User info */}
                  <div className="flex items-center mt-2 space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(activity.user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user}
                    </span>
                  </div>

                  {/* Metadata badges */}
                  {activity.metadata && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activity.metadata.company_name && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.company_name}
                        </Badge>
                      )}
                      {activity.metadata.contact_method && (
                        <Badge variant="outline" className="text-xs">
                          vía {activity.metadata.contact_method}
                        </Badge>
                      )}
                      {activity.metadata.new_status && (
                        <Badge variant="outline" className="text-xs">
                          → {activity.metadata.new_status}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-[2.5rem] mt-10 w-px h-6 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No hay actividad reciente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};