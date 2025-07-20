import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/Lead';
import { useLeadActivities } from '@/hooks/useLeadActivitiesSimple';
import { Activity, Clock, Mail, Phone, Calendar, Plus, FileText, CheckCircle, StickyNote, Upload, Edit } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadActivityTabProps {
  lead: Lead;
}

export const LeadActivityTab = ({ lead }: LeadActivityTabProps) => {
  const { activities, isLoading } = useLeadActivities(lead.id);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'note_created': return StickyNote;
      case 'task_created': return Plus;
      case 'task_completed': return CheckCircle;
      case 'file_uploaded': return Upload;
      case 'lead_created': return Activity;
      case 'lead_updated': return Edit;
      case 'email_sent': return Mail;
      case 'first_contact': 
      case 'last_contact': return Phone;
      default: return Activity;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'note_created': return 'hsl(213, 94%, 68%)';
      case 'task_created': return 'hsl(42, 100%, 50%)';
      case 'task_completed': return 'hsl(158, 100%, 38%)';
      case 'file_uploaded': return 'hsl(280, 100%, 70%)';
      case 'lead_created': return 'hsl(158, 100%, 38%)';
      case 'lead_updated': return 'hsl(42, 100%, 50%)';
      case 'email_sent': return 'hsl(213, 94%, 68%)';
      case 'first_contact':
      case 'last_contact': return 'hsl(30, 100%, 50%)';
      default: return 'hsl(213, 94%, 68%)';
    }
  };

  // Create system activities based on lead data
  const systemActivities = [];
  
  // Lead creation activity
  systemActivities.push({
    id: 'lead-created',
    activity_type: 'lead_created',
    title: 'Lead creado',
    description: `Lead creado desde ${lead.source}`,
    created_at: lead.created_at,
    activity_data: { source: lead.source }
  });

  // Lead update activity (if different from creation)
  if (lead.updated_at !== lead.created_at) {
    systemActivities.push({
      id: 'lead-updated',
      activity_type: 'lead_updated',
      title: 'Lead actualizado',
      description: `Información del lead actualizada`,
      created_at: lead.updated_at,
      activity_data: {}
    });
  }

  // First contact activity
  if (lead.first_contact_date) {
    systemActivities.push({
      id: 'first-contact',
      activity_type: 'first_contact',
      title: 'Primer contacto',
      description: 'Primer contacto establecido con el lead',
      created_at: lead.first_contact_date,
      activity_data: {}
    });
  }

  // Last contact activity (if different from first)
  if (lead.last_contact_date && lead.last_contact_date !== lead.first_contact_date) {
    systemActivities.push({
      id: 'last-contact',
      activity_type: 'last_contact',
      title: 'Último contacto',
      description: 'Contacto más reciente con el lead',
      created_at: lead.last_contact_date,
      activity_data: {}
    });
  }

  // Combine real activities with system activities
  const allActivities = [...activities, ...systemActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted"></div>
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Track all interactions and changes for this lead
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {allActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.activity_type);
          const color = getActivityColor(activity.activity_type);
          const isLast = index === allActivities.length - 1;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div 
                  className="absolute left-6 top-12 w-0.5 h-12 bg-border"
                  style={{ height: '60px' }}
                />
              )}
              
              {/* Activity item */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background"
                  style={{ borderColor: color }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: color }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          {activity.activity_data && Object.keys(activity.activity_data).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {activity.activity_data.note_type && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.activity_data.note_type}
                                </Badge>
                              )}
                              {activity.activity_data.priority && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.activity_data.priority} priority
                                </Badge>
                              )}
                              {activity.activity_data.file_size && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(activity.activity_data.file_size / 1024)} KB
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{allActivities.length}</p>
              <p className="text-sm text-muted-foreground">Total Actividades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {allActivities.filter(a => a.activity_type.includes('note')).length}
              </p>
              <p className="text-sm text-muted-foreground">Notas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {allActivities.filter(a => a.activity_type.includes('task')).length}
              </p>
              <p className="text-sm text-muted-foreground">Tareas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {allActivities.filter(a => a.activity_type.includes('file')).length}
              </p>
              <p className="text-sm text-muted-foreground">Archivos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      {lead.next_follow_up_date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Seguimiento programado</h4>
                <p className="text-sm text-muted-foreground">
                  Próximo contacto programado para {format(new Date(lead.next_follow_up_date), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>
              <Badge variant="outline">
                Pendiente
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for activities */}
      {allActivities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay actividades aún</h3>
            <p className="text-muted-foreground mb-4">
              Empieza a interactuar con este lead para ver actividades aquí
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Actividad
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};