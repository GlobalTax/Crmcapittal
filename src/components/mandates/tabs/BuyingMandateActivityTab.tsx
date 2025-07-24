import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, Target, Clock } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BuyingMandateActivityTabProps {
  mandate: BuyingMandate;
}

export const BuyingMandateActivityTab = ({
  mandate
}: BuyingMandateActivityTabProps) => {
  // Mock activity data - in real implementation, this would come from API
  const mockActivities = [
    {
      id: '1',
      type: 'mandate_created',
      title: 'Mandato creado',
      description: `Mandato "${mandate.mandate_name}" creado para ${mandate.client_name}`,
      timestamp: mandate.created_at,
      user: mandate.created_by || 'Sistema',
      icon: FileText
    },
    {
      id: '2',
      type: 'mandate_updated',
      title: 'Mandato actualizado',
      description: 'Se actualizaron los criterios de búsqueda',
      timestamp: mandate.updated_at,
      user: mandate.created_by || 'Sistema',
      icon: Calendar
    }
  ];

  const getActivityIcon = (type: string) => {
    const iconMap = {
      mandate_created: FileText,
      mandate_updated: Calendar,
      target_added: Target,
      target_contacted: User,
      document_uploaded: FileText,
      status_changed: Clock
    };
    return iconMap[type as keyof typeof iconMap] || Calendar;
  };

  const getActivityBadge = (type: string) => {
    const badgeMap = {
      mandate_created: { label: 'Creación', variant: 'default' as const },
      mandate_updated: { label: 'Actualización', variant: 'secondary' as const },
      target_added: { label: 'Target', variant: 'default' as const },
      target_contacted: { label: 'Contacto', variant: 'default' as const },
      document_uploaded: { label: 'Documento', variant: 'outline' as const },
      status_changed: { label: 'Estado', variant: 'secondary' as const }
    };
    const config = badgeMap[type as keyof typeof badgeMap] || { label: 'Actividad', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Línea de Tiempo del Mandato</h3>
        <p className="text-sm text-muted-foreground">
          Historial completo de actividades para {mandate.mandate_name}
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const ActivityIcon = activity.icon;
          const isLast = index === mockActivities.length - 1;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
              )}
              
              <Card className="ml-12">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        {getActivityBadge(activity.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Timeline icon */}
              <div className="absolute left-0 top-4 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>

      {/* No Activity State */}
      {mockActivities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay actividad</h3>
            <p className="text-sm text-muted-foreground text-center">
              Aún no se han registrado actividades para este mandato.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};