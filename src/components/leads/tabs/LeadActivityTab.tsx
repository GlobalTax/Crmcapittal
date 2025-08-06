
import { Lead } from '@/types/Lead';
import { useLeadActivities } from '@/hooks/leads/useLeadActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, MessageSquare, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadActivityTabProps {
  lead: Lead;
}

export const LeadActivityTab = ({ lead }: LeadActivityTabProps) => {
  const { activities, isLoading, createActivity } = useLeadActivities(lead.id);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL_MADE':
        return <Phone className="h-4 w-4" />;
      case 'MEETING_SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      case 'EMAIL_SENT':
      case 'EMAIL_OPENED':
      case 'EMAIL_CLICKED':
        return <Mail className="h-4 w-4" />;
      case 'DOCUMENT_DOWNLOADED':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CALL_MADE':
        return 'text-blue-600';
      case 'MEETING_SCHEDULED':
        return 'text-green-600';
      case 'EMAIL_SENT':
      case 'EMAIL_OPENED':
      case 'EMAIL_CLICKED':
        return 'text-purple-600';
      case 'DOCUMENT_DOWNLOADED':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'EMAIL_SENT':
        return 'Email enviado';
      case 'EMAIL_OPENED':
        return 'Email abierto';
      case 'EMAIL_CLICKED':
        return 'Email clickeado';
      case 'CALL_MADE':
        return 'Llamada realizada';
      case 'MEETING_SCHEDULED':
        return 'Reunión programada';
      case 'FORM_SUBMITTED':
        return 'Formulario enviado';
      case 'WEBSITE_VISIT':
        return 'Visita al sitio web';
      case 'DOCUMENT_DOWNLOADED':
        return 'Documento descargado';
      case 'STAGE_CHANGED':
        return 'Estado cambiado';
      default:
        return 'Actividad';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Actividades del Lead</CardTitle>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Actividad
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay actividades registradas para este lead.
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{getActivityLabel(activity.activity_type)}</h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    {activity.activity_data && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {typeof activity.activity_data === 'object' 
                          ? JSON.stringify(activity.activity_data) 
                          : String(activity.activity_data)
                        }
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </span>
                      {activity.points_awarded && (
                        <span className="ml-4">
                          +{activity.points_awarded} puntos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
